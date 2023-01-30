import tensorflow as tf
import math
import os
import numpy as np
from PIL import Image

from .utils import (
    cvtColor,
    resize_image,
    resize_label,
    normalize
)

class UnetDataset(tf.keras.utils.Sequence):

    def __init__(self, annotation_lines, input_shape, batch_size, num_classes,
                 train, dataset_path):
        self.annotation_lines = annotation_lines
        self.length = len(self.annotation_lines)
        self.input_shape = input_shape
        self.batch_size = batch_size
        self.num_classes = num_classes
        self.train = train
        self.dataset_path = dataset_path

    def __len__(self):
        return math.ceil(len(self.annotation_lines) / float(self.batch_size))

    def __getitem__(self, index):
        images = []
        targets = []
        for i in range(index * self.batch_size, (index + 1) * self.batch_size):
            i = i % self.length
            name = self.annotation_lines[i].split()[0]
            jpg = Image.open(
                os.path.join(os.path.join(self.dataset_path, "JPEGImages"),
                             name + ".jpg"))
            png = Image.open(
                os.path.join(
                    os.path.join(self.dataset_path, "SegmentationClassPNG"),
                    name + ".png"))

            jpg, png = self.process_data(jpg,
                                         png,
                                         self.input_shape,
                                         random=self.train)

            images.append(jpg)
            targets.append(png)

        images = np.array(images)
        targets = np.array(targets)
        return images, targets

    def rand(self, a=0, b=1):
        return np.random.rand() * (b - a) + a

    def process_data(self, image, label, input_shape, random=True):
        image = cvtColor(image)
        label = Image.fromarray(np.array(label))
        h, w, _ = input_shape

        # resize
        image, _, _ = resize_image(image, (w, h))
        label, _, _ = resize_label(label, (w, h))

        if random:
            # flip
            flip = self.rand() < .5
            if flip:
                image = image.transpose(Image.FLIP_LEFT_RIGHT)
                label = label.transpose(Image.FLIP_LEFT_RIGHT)

        # np
        image = np.array(image, np.float32)
        image = normalize(image)

        label = np.array(label)
        label[label >= self.num_classes] = self.num_classes

        return image, label