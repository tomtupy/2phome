import os
import random
import glob
import argparse
import os.path as osp
import sys


def get_file_names(dir, filter="*.png"):
    names = []
    for file_path in glob.glob(os.path.join(dir, filter)):
        filename = os.path.basename(file_path)
        names.append(filename)
    return names


if __name__ == "__main__":
    random.seed(0)

    parser = argparse.ArgumentParser(
        formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument("dataset_dir", help="dataset directory")
    parser.add_argument("--validation_pct", help="validation percentage", required=False, default=1, type=float)
    parser.add_argument("--train_pct", help="training percentage", required=False, default=0.9, type=float)
    args = parser.parse_args()

    if not osp.exists(args.dataset_dir):
        print("Dataset directory does noty exist:", args.dataset_dir)
        sys.exit(1)

    print("Generate txt in ImageSets.")

    seg_filepath = os.path.join(args.dataset_dir, 'SegmentationClassPNG')
    saveBasePath = os.path.join(args.dataset_dir, 'ImageSets/Segmentation')
    if not os.path.exists(saveBasePath):
        os.makedirs(saveBasePath)

    total_seg = get_file_names(seg_filepath)

    num = len(total_seg)
    seg_list = range(num)
    tv = int(num * args.validation_pct)
    tr = int(tv * args.train_pct)
    trainval = random.sample(seg_list, tv)
    train = random.sample(trainval, tr)

    print("train and val size", tv)
    print("train size", tr)

    trainval_txt = open(os.path.join(saveBasePath, 'trainval.txt'),
                        'w',
                        encoding="utf8")
    test_txt = open(os.path.join(saveBasePath, 'test.txt'),
                    'w',
                    encoding="utf8")
    train_txt = open(os.path.join(saveBasePath, 'train.txt'),
                     'w',
                     encoding="utf8")
    val_txt = open(os.path.join(saveBasePath, 'val.txt'), 'w', encoding="utf8")

    for i in seg_list:
        name = total_seg[i][:-4] + '\n'
        if i in trainval:
            trainval_txt.write(name)
            if i in train:
                train_txt.write(name)
            else:
                val_txt.write(name)
        else:
            test_txt.write(name)

    trainval_txt.close()
    train_txt.close()
    val_txt.close()
    test_txt.close()

    print("Generate txt in ImageSets done.")