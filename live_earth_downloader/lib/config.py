import logging
import coloredlogs
import configparser

def parse_image_dimension_str(dim_str):
    return [int(dim) for dim in dim_str.split('x')]

def parse_image_subsel_dimension_str(dim_str):
    return [int(dim) for dim in dim_str.split(',')[2].split('x')]

def parse_image_subsel_position_str(dim_str):
    return [int(dim) for dim in dim_str.split(',')[0:2]]

# Create a logger object.
logger = logging.getLogger(__name__)
coloredlogs.install(level='DEBUG')

# Load config
CONFIG_FILE = 'config.ini'
config = configparser.ConfigParser()
config.read(CONFIG_FILE)

IMAGE_SIZE = config['common']['ImageSize']
IMAGE_FORMAT = config['common']['ImageFormat']
IMAGE_DATA_LOCATION = config['common']['ImageDataLocation']
DATA_FILE_LINK_PREFIX = config['downloader']['DataFileLinkPrefix']
LINK_MATCH_STR = DATA_FILE_LINK_PREFIX + IMAGE_SIZE + IMAGE_FORMAT
DELETE_OLD_DATA = config.getboolean('downloader', 'DeleteOldData')
KEEP_MOST_RECENT_IMAGE = config.getboolean(
    'downloader', 'SkipMostRecentImageCleanup'
)
DATA_URL = config['downloader']['DataURL']
POLL_TIME_SEC = config.getint('downloader', 'PollTimeSec')
INITIAL_DOWNLOAD_WINDOW_MINS = config.getint('common', 'DisplayWindowMins')
IMAGE_DIMENSIONS = parse_image_dimension_str(config['common']['ImageSize'])

IMAGE_POSTPROCESSING_ENABLED = config.getboolean('imageprocessor', 'Enabled')
IMAGE_POSTPROCESSING_SUBSEL_SIZE = parse_image_subsel_dimension_str(config['imageprocessor']['ImageSubSelection'])
IMAGE_POSTPROCESSING_SUBSEL_POS = parse_image_subsel_position_str(config['imageprocessor']['ImageSubSelection'])

DRIVER_PATH = './drivers/chromedriver'