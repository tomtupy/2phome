import tensorflow as tf
import os
import matplotlib.pyplot as plt
import argparse
import os.path as osp
import sys
from tensorflow.python.client import device_lib
from IPython.display import clear_output

from lib.model import (
    unet_model,
    ModelCheckpointCallback,
    NUM_CLASSES,
    INPUT_SHAPE,
    BATCH_SIZE,
)
from lib.dataset import (
    UnetDataset,
)

print("DEVICES")
print(device_lib.list_local_devices())


EPOCHS = 25
VAL_SUBSPLITS = 1

dataset_path = '/home/tom/2phome/drywell_cam_images/images/datasets2/train_voc'

parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
parser.add_argument("dataset_dir", help="dataset directory")
args = parser.parse_args()

if not osp.exists(args.dataset_dir):
    print("Dataset directory does noty exist:", args.dataset_dir)
    sys.exit(1)

# read dataset txt files
with open(os.path.join(args.dataset_dir, "ImageSets", "Segmentation", "train.txt"),
          "r",
          encoding="utf8") as f:
    train_lines = f.readlines()

with open(os.path.join(args.dataset_dir, "ImageSets", "Segmentation","val.txt"),
          "r",
          encoding="utf8") as f:
    val_lines = f.readlines()

train_batches = UnetDataset(train_lines, INPUT_SHAPE, BATCH_SIZE, NUM_CLASSES,
                            True, args.dataset_dir)
val_batches = UnetDataset(val_lines, INPUT_SHAPE, BATCH_SIZE, NUM_CLASSES,
                          False, args.dataset_dir)

STEPS_PER_EPOCH = len(train_lines) // BATCH_SIZE
VALIDATION_STEPS = len(val_lines) // BATCH_SIZE // VAL_SUBSPLITS



images, masks = train_batches.__getitem__(0)
sample_image, sample_mask = images[0], masks[0]
sample_mask = sample_mask[..., tf.newaxis]
# display([sample_image, sample_mask])


### TRAINING
model = unet_model(output_channels=NUM_CLASSES)
model.compile(
    optimizer='adam',
    loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
    metrics=['accuracy'])

model_summary = model.summary()

print(model_summary)

### CALLBACKS
class DisplayCallback(tf.keras.callbacks.Callback):

    def on_epoch_end(self, epoch, logs=None):
        clear_output(wait=True)
        if epoch > 23:
            show_predictions()
        print('\nSample Prediction after epoch {}\n'.format(epoch + 1))

def show_predictions(dataset=None, num=1):
    if dataset:
        for image, mask in dataset.take(num):
            pred_mask = model.predict(image)
            display([image[0], mask[0], create_mask(pred_mask)])
    else:
        display([
            sample_image, sample_mask,
            create_mask(model.predict(sample_image[tf.newaxis, ...]))
        ])


def create_mask(pred_mask):
    pred_mask = tf.argmax(pred_mask, axis=-1)
    pred_mask = pred_mask[..., tf.newaxis]
    return pred_mask[0]

def display(display_list):
    plt.figure(figsize=(15, 15))

    title = ['Input Image', 'True Mask', 'Predicted Mask']

    for i in range(len(display_list)):
        plt.subplot(1, len(display_list), i + 1)
        plt.title(title[i])
        plt.imshow(tf.keras.utils.array_to_img(display_list[i]))
        plt.axis('off')
    plt.show()

displayCallback = DisplayCallback()

if not os.path.exists('logs'):
    os.makedirs('logs')
checkpointCallback = ModelCheckpointCallback(
    'logs/ep{epoch:03d}-loss{loss:.3f}-val_loss{val_loss:.3f}.h5',
    monitor='val_loss',
    save_weights_only=True,
    save_best_only=True,
    period=1)

model_history = model.fit(train_batches,
                          epochs=EPOCHS,
                          steps_per_epoch=STEPS_PER_EPOCH,
                          validation_steps=VALIDATION_STEPS,
                          validation_data=val_batches,
                          callbacks=[displayCallback, checkpointCallback])

model.save(os.path.join("logs", "logs/the-last-model.h5"), overwrite=True)

loss = model_history.history['loss']
val_loss = model_history.history['val_loss']

plt.figure()
plt.plot(model_history.epoch, loss, 'r', label='Training loss')
plt.plot(model_history.epoch, val_loss, 'bo', label='Validation loss')
plt.title('Training and Validation Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss Value')
plt.ylim([0, 1])
plt.legend()
plt.show()