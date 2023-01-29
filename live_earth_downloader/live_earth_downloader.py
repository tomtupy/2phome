from lib.utils import (
    get_current_utc_timestamp,
    get_image_file_list,
    get_image_file_path,
    get_timestamp_from_file_path,
    verify_image_dir_existence,
    get_last_downloaded_image_timestamp,
    get_online_file_url_list,
    get_timestamp_from_file_url
)
import os
from time import sleep
import urllib.request
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
import lib.config as conf
import newrelic.agent


chrome_options = Options()
chrome_options.headless = True
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument("--headless")
user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36'
chrome_options.add_argument(f'user-agent={user_agent}')


# Check for image dir, create if not found
if not verify_image_dir_existence(conf.IMAGE_DATA_LOCATION):
    conf.logger.error('Image location directory not found!')
    raise FileNotFoundError

# Get initial timestamp
last_timestamp = get_current_utc_timestamp(
    conf.INITIAL_DOWNLOAD_WINDOW_MINS
)
latest_downloaded_timestamp = get_last_downloaded_image_timestamp()
if (
    latest_downloaded_timestamp and
    latest_downloaded_timestamp > last_timestamp
):
    last_timestamp = latest_downloaded_timestamp
conf.logger.debug('Initial data timestamp: ' + str(last_timestamp))


@newrelic.agent.background_task()
def download_and_process_imagery(last_timestamp):
    # check for new data
    driver = webdriver.Chrome(options=chrome_options, executable_path=conf.DRIVER_PATH)

    wait = WebDriverWait(driver, 40)
    driver.get(conf.DATA_URL)

    # get link entries
    file_list_entries = get_online_file_url_list(driver)

    # download any new entries
    conf.logger.info(f'Got {str(len(file_list_entries))} entries...')
    newrelic.agent.record_custom_metric('entries_found', len(file_list_entries))
    downloaded_image_count = 0
    downloaded_failure_count = 0
    for file_url in file_list_entries:
        timestamp = get_timestamp_from_file_url(file_url)
        if timestamp <= last_timestamp:
            continue

        last_timestamp = timestamp
        conf.logger.info('Downloading ' + file_url)
        try:
            urllib.request.urlretrieve(
                file_url,
                get_image_file_path(
                    conf.IMAGE_DATA_LOCATION,
                    (str(timestamp) + conf.IMAGE_FORMAT))
            )
            downloaded_image_count += 1
        except Exception as err:
            conf.logger.warning(
                'Image download failed: {0}'.format(err)
            )
            newrelic.agent.notice_error()
            downloaded_failure_count += 1
    newrelic.agent.record_custom_metric('entries_downloaded', downloaded_image_count)
    newrelic.agent.record_custom_metric('entries_download_failures', downloaded_failure_count)

    # tear down driver
    driver.quit()

    # cleanup old images
    images_deleted = 0
    if conf.DELETE_OLD_DATA:
        oldest_timestamp = get_current_utc_timestamp(
            conf.INITIAL_DOWNLOAD_WINDOW_MINS
        )

        image_file_list = get_image_file_list(
            conf.IMAGE_DATA_LOCATION, conf.IMAGE_FORMAT
        )
        for image_filename in image_file_list[:-1] if conf.KEEP_MOST_RECENT_IMAGE else image_file_list:
            timestamp = get_timestamp_from_file_path(image_filename)
            if (timestamp >= oldest_timestamp):
                break
            else:
                conf.logger.info('Deleting ' + image_filename)
                os.remove(image_filename)
                images_deleted += 1
    newrelic.agent.record_custom_metric('entries_deleted', images_deleted)
    return last_timestamp

# main loop
while True:
    try:
        last_timestamp = download_and_process_imagery(last_timestamp)
    except Exception as err:
        conf.logger.warning(
                'Imagery fetch failed: {0}'.format(err)
            )
        newrelic.agent.notice_error()

    # Sleep
    conf.logger.info('Sleeping for ' + str(conf.POLL_TIME_SEC) + ' seconds')
    sleep(conf.POLL_TIME_SEC)
