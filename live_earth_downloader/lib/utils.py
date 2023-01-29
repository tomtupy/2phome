from datetime import datetime, timedelta
import glob
import os
from bs4 import BeautifulSoup
import lib.config as conf


def get_last_downloaded_image_timestamp():
    image_file_list = get_image_file_list(
        conf.IMAGE_DATA_LOCATION, conf.IMAGE_FORMAT
    )
    if (len(image_file_list) > 0):
        conf.logger.debug('Found ' + str(len(image_file_list)) + ' images.')
        last_image_file = image_file_list[-1]
        return get_timestamp_from_file_path(last_image_file)
    conf.logger.warning('No images were found!')
    return None


def get_online_file_url_list(driver):
    page = None
    try:
        driver.get(conf.DATA_URL)
        page = driver.page_source
    except Exception as err:
        conf.logger.warning('Data query failed: {0}'.format(err))
        return []
    else:
        soup = BeautifulSoup(page, 'html.parser')
        url_list = [
            conf.DATA_URL + node.get('href')
            for node in soup.find_all('a')
            if node.get('href').endswith(conf.LINK_MATCH_STR)
        ]
        conf.logger.debug('Found ' +
                     str(len(url_list)) +
                     ' images availalble for download.')
        return url_list


def get_timestamp_from_file_url(file_url):
    filename = file_url.replace(conf.DATA_URL, '')
    timestamp = filename.replace('_' + conf.LINK_MATCH_STR, '')
    return int(timestamp)

def compute_list_diff(list1, list2):
    return [element for element in list1 if element not in list2]


def get_timestamp_from_file_path(file_path):
    return int(os.path.splitext(os.path.basename(file_path))[0])


def get_image_file_list(data_path, image_format):
    return sorted(
        glob.glob(os.path.normpath(data_path) + '/*' + image_format)
    )


def get_image_file_path(path, filename):
    return os.path.abspath(path) + '/' + filename


def get_current_utc_timestamp(preceeding_minutes=0):
    # Timestamp format:
    # 4 digit year
    # 3 digit day of year
    # 2 digit hour
    # 2 digit minute
    # 2 digit second - <discard>
    # 1 digit tenth of second - <discard>
    dt_now = datetime.utcnow() - timedelta(minutes=preceeding_minutes)
    return int(dt_now.strftime('%Y%j%H%M'))


def get_image_list_within_window(display_window_mins, image_location, image_format):
    oldest_allowable_timestamp = get_current_utc_timestamp(display_window_mins)
    return [
        image_file for image_file in
        get_image_file_list(image_location, image_format)
        if get_timestamp_from_file_path(image_file) >=
        oldest_allowable_timestamp
    ]


def verify_image_dir_existence(dir_path):
    if not os.path.exists(dir_path):
        os.mkdir(dir_path)
    return os.path.exists(dir_path)