package datastreamprocessor;

import java.util.AbstractMap;
import java.util.HashMap;
import java.util.Map;
public class SensorDataMessage {
    public Integer timestamp;
    public String sensor;
    public SensorData data;

    private Map<String, Integer> sensor_map;

    public SensorDataMessage() {
        sensor_map = new HashMap<String, Integer>() {{
            put("ground_temp", 1234);
            put("roof_temp_far_west", 1235);
            put("roof_temp_west", 1236);
            put("roof_temp_north", 1237);
            put("roof_temp_far_south", 1238);
            put("roof_temp_south", 1239);
            put("roof_temp_far_north", 1240);
        }};
    }

    public java.sql.Timestamp getTimestamp() {
        return new java.sql.Timestamp((long)this.timestamp*1000);
    }

    public Integer getSensorId() {
        return sensor_map.get(this.sensor);
    }

    public Float getPrimaryData() {
        return this.data.temp;
    }

    public Boolean hasSecondaryData() {
        return this.data.hum != null;
    }

    public Float getSecondaryData() {
        return this.data.hum;
    }

    public AbstractMap<String, Float> getNewRelicMetrics() {
        AbstractMap<String, Float> metrics = new HashMap<>();
        metrics.put("sensor_data/" + this.sensor, this.data.temp);
        if (this.hasSecondaryData()) {
            metrics.put("sensor_data/" + this.sensor.replace("temp","humidity"), this.data.hum);
        }
        return metrics;
    }
}
