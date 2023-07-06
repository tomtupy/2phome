import sys
from wyze_sdk import Client
client = Client(email='', password="")
response = client.thermostats.info(
    device_mac='',
    device_model='WLPA19C')

print(response.temperature, ',', response.humidity, ',', response.heating_setpoint, ',', response.system_mode.name, ',', response.fan_mode.name, ',', response.current_scenario.name)

sys.stdout.flush()