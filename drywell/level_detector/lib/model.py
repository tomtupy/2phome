import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
import os.path as osp
import copy
import tensorflow as tf
import warnings
import numpy as np
import cv2
import matplotlib.pyplot as plt
import os.path as osp
import copy


from .utils import (
    resize_image,
    normalize,
)

colors = [(0, 0, 0), (128, 0, 0), (0, 128, 0), (128, 128, 0), (0, 0, 128),
          (128, 0, 128), (0, 128, 128), (128, 128, 128),
          (64, 0, 0), (192, 0, 0), (64, 128, 0), (192, 128, 0), (64, 0, 128),
          (192, 0, 128), (64, 128, 128), (192, 128, 128), (0, 64, 0),
          (128, 64, 0), (0, 192, 0), (128, 192, 0), (0, 64, 128),
          (128, 64, 12)]

NUM_CLASSES = 3 # class number + 1 (background)
INPUT_SHAPE = [640, 480, 3] # (H, W, C)
BATCH_SIZE = 2
EPOCHS = 25
VAL_SUBSPLITS = 1


class ModelCheckpointCallback(tf.keras.callbacks.Callback):

    def __init__(self,
                 filepath,
                 monitor='val_loss',
                 verbose=0,
                 save_best_only=False,
                 save_weights_only=False,
                 mode='auto',
                 period=1):
        super(ModelCheckpointCallback, self).__init__()
        self.monitor = monitor
        self.verbose = verbose
        self.filepath = filepath
        self.save_best_only = save_best_only
        self.save_weights_only = save_weights_only
        self.period = period
        self.epochs_since_last_save = 0

        if mode not in ['auto', 'min', 'max']:
            warnings.warn(
                'ModelCheckpoint mode %s is unknown, '
                'fallback to auto mode.' % (mode), RuntimeWarning)
            mode = 'auto'

        if mode == 'min':
            self.monitor_op = np.less
            self.best = np.Inf
        elif mode == 'max':
            self.monitor_op = np.greater
            self.best = -np.Inf
        else:
            if 'acc' in self.monitor or self.monitor.startswith('fmeasure'):
                self.monitor_op = np.greater
                self.best = -np.Inf
            else:
                self.monitor_op = np.less
                self.best = np.Inf

    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        self.epochs_since_last_save += 1
        if self.epochs_since_last_save >= self.period:
            self.epochs_since_last_save = 0
            filepath = self.filepath.format(epoch=epoch + 1, **logs)
            if self.save_best_only:
                current = logs.get(self.monitor)
                if current is None:
                    warnings.warn(
                        'Can save best model only with %s available, '
                        'skipping.' % (self.monitor), RuntimeWarning)
                else:
                    if self.monitor_op(current, self.best):
                        if self.verbose > 0:
                            print(
                                '\nEpoch %05d: %s improved from %0.5f to %0.5f,'
                                ' saving model to %s' %
                                (epoch + 1, self.monitor, self.best, current,
                                 filepath))
                        self.best = current
                        if self.save_weights_only:
                            self.model.save_weights(filepath, overwrite=True)
                        else:
                            self.model.save(filepath, overwrite=True)
                    else:
                        if self.verbose > 0:
                            print('\nEpoch %05d: %s did not improve' %
                                  (epoch + 1, self.monitor))
            else:
                if self.verbose > 0:
                    print('\nEpoch %05d: saving model to %s' %
                          (epoch + 1, filepath))
                if self.save_weights_only:
                    self.model.save_weights(filepath, overwrite=True)
                else:
                    self.model.save(filepath, overwrite=True)


# https://www.tensorflow.org/tutorials/generative/pix2pix
def upsample(filters, size, apply_dropout=False):
    initializer = tf.random_normal_initializer(0., 0.02)

    result = tf.keras.Sequential()
    result.add(
        tf.keras.layers.Conv2DTranspose(filters,
                                        size,
                                        strides=2,
                                        padding='same',
                                        kernel_initializer=initializer,
                                        use_bias=False))

    result.add(tf.keras.layers.BatchNormalization())

    if apply_dropout:
        result.add(tf.keras.layers.Dropout(0.5))

    result.add(tf.keras.layers.ReLU())

    return result

base_model = tf.keras.applications.MobileNetV2(input_shape=INPUT_SHAPE,
                                               include_top=False)

# Use the activations of these layers
layer_names = [
    'block_1_expand_relu',  # 64x64
    'block_3_expand_relu',  # 32x32
    'block_6_expand_relu',  # 16x16
    'block_13_expand_relu',  # 8x8
    'block_16_project',  # 4x4
]
base_model_outputs = [
    base_model.get_layer(name).output for name in layer_names
]

# Create the feature extraction model
down_stack = tf.keras.Model(inputs=base_model.input,
                            outputs=base_model_outputs)

down_stack.trainable = False

up_stack = [
    upsample(512, 3),  # 4x4 -> 8x8
    upsample(256, 3),  # 8x8 -> 16x16
    upsample(128, 3),  # 16x16 -> 32x32
    upsample(64, 3),  # 32x32 -> 64x64
]


def unet_model(output_channels: int):
    inputs = tf.keras.layers.Input(shape=INPUT_SHAPE)

    # Downsampling through the model
    skips = down_stack(inputs)
    x = skips[-1]
    skips = reversed(skips[:-1])

    # Upsampling and establishing the skip connections
    for up, skip in zip(up_stack, skips):
        x = up(x)
        concat = tf.keras.layers.Concatenate()
        print(x)
        print(skip)
        x = concat([x, skip])

    # This is the last layer of the model
    last = tf.keras.layers.Conv2DTranspose(filters=output_channels,
                                           kernel_size=3,
                                           strides=2,
                                           padding='same')  #64x64 -> 128x128

    x = last(x)

    return tf.keras.Model(inputs=inputs, outputs=x)

def load_model(model_path):
    model = unet_model(output_channels=NUM_CLASSES)
    model.load_weights(model_path)
    print('{} model loaded.'.format(model_path))
    return model


def get_predicted_segmentation_mask(image, model):
    old_img = copy.deepcopy(image)
    ori_h = np.array(image).shape[0]
    ori_w = np.array(image).shape[1]

    # resize and add gray placeholders
    image_data, nw, nh = resize_image(image, (INPUT_SHAPE[1], INPUT_SHAPE[0]))
    image_data = normalize(np.array(image_data, np.float32))
    image_data = np.expand_dims(image_data, 0)
    pr = model.predict(image_data)[0]
    ## remove gray placeholders
    pr = pr[int((INPUT_SHAPE[0] - nh) // 2) : int((INPUT_SHAPE[0] - nh) // 2 + nh), \
                int((INPUT_SHAPE[1] - nw) // 2) : int((INPUT_SHAPE[1] - nw) // 2 + nw)]
    pr = cv2.resize(pr, (ori_w, ori_h), interpolation=cv2.INTER_LINEAR)
    pr = pr.argmax(axis=-1)
    seg_img = np.zeros((np.shape(pr)[0], np.shape(pr)[1], 3))
    seg_img = np.reshape(
        np.array(colors, np.uint8)[np.reshape(pr, [-1])], [ori_h, ori_w, -1])

    return seg_img


