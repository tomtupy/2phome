import os
import pika
from datetime import datetime
from datetime import timedelta
import base64
import signal
import sys
import psycopg2
import newrelic.agent
import json
import glob

RMQ_USER = "ace"
RMQ_PASSWORD = ""
RMQ_HOST = "localhost"
RMQ_PORT = 5672
RMQ_QUEUE = "sensor_data"
RMQ_ROUTEKEY = RMQ_QUEUE
PG_HOST = "0.0.0.0"
PG_USER = "tom"
PG_PASSWORD = ""
PG_DB = "2phome"

@newrelic.agent.background_task()
def queue_callback(channel, method, properties, body):
  if len(method.exchange):
    print("from exchange '{}': {}".format(method.exchange,body.decode('UTF-8')))
  else:
    #print("from queue {}: {}".format(method.routing_key,body.decode('UTF-8')))
    print("recived message from queue", properties)
    timestamp = properties.headers.get('timestamp')
    sensor = properties.headers.get('sensor')
    data = json.loads(body.decode('UTF-8'))['data']
    print("DATA", sensor, timestamp, data)
    if sensor == 'ground_temp':
      dt = datetime.fromtimestamp(timestamp)
      #data = body.decode('UTF-8')
      newrelic.agent.record_custom_metric('sensor_data/ground_temp', int(float(data)))
      dbcur.execute("INSERT INTO public.sensor_data (time, sensor_id, data) VALUES (%s, %s, %s)", (dt, 1234, float(data)))
    elif sensor == 'roof_temp_far_west':
      dt = datetime.fromtimestamp(timestamp)
      #data = json.loads(body.decode('UTF-8'))
      newrelic.agent.record_custom_metric('sensor_data/roof_temp_far_west', int(float(data['temp'])))
      dbcur.execute("INSERT INTO public.sensor_data (time, sensor_id, data) VALUES (%s, %s, %s)", (dt, 1235, float(data['temp'])))
    elif sensor == 'roof_temp_west':
      dt = datetime.fromtimestamp(timestamp)
      #data = json.loads(body.decode('UTF-8'))
      newrelic.agent.record_custom_metric('sensor_data/roof_temp_west', int(float(data['temp'])))
      newrelic.agent.record_custom_metric('sensor_data/roof_humidity_west', int(float(data['hum'])))
      dbcur.execute("INSERT INTO public.sensor_data (time, sensor_id, data, secondary_data) VALUES (%s, %s, %s, %s)", (dt, 1236, float(data['temp']), float(data['hum'])))
    elif sensor == 'roof_temp_north':
      dt = datetime.fromtimestamp(timestamp)
      #data = json.loads(body.decode('UTF-8'))
      newrelic.agent.record_custom_metric('sensor_data/roof_temp_north', int(float(data['temp'])))
      newrelic.agent.record_custom_metric('sensor_data/roof_humidity_north', int(float(data['hum'])))
      dbcur.execute("INSERT INTO public.sensor_data (time, sensor_id, data, secondary_data) VALUES (%s, %s, %s, %s)", (dt, 1237, float(data['temp']), float(data['hum'])))
    elif sensor == 'roof_temp_far_south':
      dt = datetime.fromtimestamp(timestamp)
      #data = json.loads(body.decode('UTF-8'))
      newrelic.agent.record_custom_metric('sensor_data/roof_temp_far_south', int(float(data['temp'])))
      dbcur.execute("INSERT INTO public.sensor_data (time, sensor_id, data) VALUES (%s, %s, %s)", (dt, 1238, float(data['temp'])))
    elif sensor == 'roof_temp_south':
      dt = datetime.fromtimestamp(timestamp)
      #data = json.loads(body.decode('UTF-8'))
      newrelic.agent.record_custom_metric('sensor_data/roof_temp_south', int(float(data['temp'])))
      dbcur.execute("INSERT INTO public.sensor_data (time, sensor_id, data) VALUES (%s, %s, %s)", (dt, 1239, float(data['temp'])))
    elif sensor == 'roof_temp_far_north':
      dt = datetime.fromtimestamp(timestamp)
      #data = json.loads(body.decode('UTF-8'))
      newrelic.agent.record_custom_metric('sensor_data/roof_temp_far_north', int(float(data['temp'])))
      dbcur.execute("INSERT INTO public.sensor_data (time, sensor_id, data) VALUES (%s, %s, %s)", (dt, 1240, float(data['temp'])))
    else:
      image_64_decode = base64.b64decode(body)
      newrelic.agent.record_custom_metric('sensor_data/wellcam', 1)
      image_result = open(f'./images/wellcam_{timestamp}.jpg', 'wb')
      image_result.write(image_64_decode)
      # delete old images
      image_file_list = sorted(
        glob.glob(os.path.normpath('./images') + '/*' + '.jpg')
      )
      dt_now = datetime.now() - timedelta(minutes=10)
      oldest_timestamp = int(dt_now.timestamp())
      images_deleted = 0
      for image_filename in image_file_list:
        timestamp = int(os.path.splitext(os.path.basename(image_filename).lstrip('wellcam_'))[0])
        if (timestamp >= oldest_timestamp):
          break
        else:
          print('Deleting ' + image_filename)
          os.remove(image_filename)
          images_deleted += 1
      newrelic.agent.record_custom_metric('drwell_cam_images_deleted', images_deleted)

def signal_handler(signal,frame):
  print("\nCTRL-C handler, cleaning up rabbitmq connection and quitting")
  connection.close()
  dbcur.close()
  dbconn.close()
  sys.exit(0)

# connect to RabbitMQ
credentials = pika.PlainCredentials(RMQ_USER, RMQ_PASSWORD)
connection = pika.BlockingConnection(pika.ConnectionParameters(RMQ_HOST, RMQ_PORT, '/', credentials ))
channel = connection.channel()

# connect to Postgres
dbconn = psycopg2.connect(host=PG_HOST, dbname=PG_DB, user=PG_USER, password=PG_PASSWORD)
dbconn.autocommit = True
dbcur = dbconn.cursor()

# dbcur.execute("SELECT child.relname AS child FROM pg_inherits JOIN pg_class parent ON pg_inherits.inhparent = parent.oid JOIN pg_class child ON pg_inherits.inhrelid = child.oid WHERE parent.relname='sensor_data' ORDER BY child DESC LIMIT 10")
# paritions = dbcur.fetchall()
# print("PARTITIONS")
# print(paritions)

# date = datetime(2022,12,21,0,0,0)
# for i in range(1000): 
#     print("DATE")
#     present_day = date.strftime("%Y-%m-%d %H:%M:%S")
#     parition_name = "sensor_data_p" + date.strftime("%Y_%m_%d")
#     print(present_day)
#     date += timedelta(days=1)
#     next_day = date.strftime("%Y-%m-%d %H:%M:%S")
#     print(next_day)
#     print(parition_name)
#     sql = "CREATE TABLE public." + parition_name + " PARTITION OF public.sensor_data FOR VALUES FROM ('" + present_day + "') TO ('" + next_day + "') TABLESPACE pg_default;" 
#     print(sql)
#     dbcur.execute(sql)
#     sql = "ALTER TABLE IF EXISTS public." + parition_name + " OWNER to tom;"
#     print(sql)
#     dbcur.execute(sql)

channel.basic_consume(queue=RMQ_QUEUE, on_message_callback=queue_callback, auto_ack=True)

# capture CTRL-C
signal.signal(signal.SIGINT, signal_handler)

print("Waiting for messages, CTRL-C to quit...")
print("")
channel.start_consuming()
