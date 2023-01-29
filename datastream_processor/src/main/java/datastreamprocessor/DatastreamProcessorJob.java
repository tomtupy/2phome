package datastreamprocessor;

import com.newrelic.api.agent.NewRelic;
import org.apache.flink.api.common.functions.MapFunction;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.connector.jdbc.JdbcConnectionOptions;
import org.apache.flink.connector.jdbc.JdbcExecutionOptions;
import org.apache.flink.connector.jdbc.JdbcSink;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.connectors.rabbitmq.RMQSource;
import org.apache.flink.streaming.connectors.rabbitmq.common.RMQConnectionConfig;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import utils.DatabaseConfig;
import utils.RabbitMqConfig;

import java.sql.Types;
import java.util.AbstractMap;
import java.util.Map;

public class DatastreamProcessorJob {
	private static final Gson gson =
			new GsonBuilder().serializeSpecialFloatingPointValues().create();
	public static void main(String[] args) throws Exception {
		// configs
		DatabaseConfig dbConf = DatabaseConfig.getInstance();
		RabbitMqConfig rabbitMqConf = RabbitMqConfig.getInstance();

		// crete streaming env
		StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

		// create rabbitmq connection
		final RMQConnectionConfig connectionConfig = new RMQConnectionConfig.Builder()
				.setHost(rabbitMqConf.host)
				.setPort(rabbitMqConf.port)
				.setUserName(rabbitMqConf.user)
				.setPassword(rabbitMqConf.password)
				.setVirtualHost(rabbitMqConf.virtualHost)
    			.build();

		final DataStream<String> stream = env
				.addSource(new RMQSource<>(
						connectionConfig,
						"sensor_data",
						true,
						new SimpleStringSchema()))
				.setParallelism(1);

		// convert message to SensorDataMessage instance
		DataStream<SensorDataMessage> messageStream = stream
				.map(json -> gson.fromJson(json, SensorDataMessage.class));

		// send metrics to NewRelic
		messageStream.map((MapFunction<SensorDataMessage, Integer>) msg -> {
			AbstractMap<String, Float> metrics = msg.getNewRelicMetrics();
			for(Map.Entry<String, Float> entry : metrics.entrySet()) {
				String key = entry.getKey();
				Float value = entry.getValue();
				System.out.println("Sending Newrelic metric: " + key + ", " + value);
				NewRelic.recordMetric(key, value);
			}
			return null;
		});

		// add database sink
		messageStream.addSink(
			JdbcSink.sink(
				"INSERT INTO public.sensor_data (time, sensor_id, data, secondary_data) VALUES (?, ?, ?, ?)",
				(statement, msg) -> {
					statement.setTimestamp(1, msg.getTimestamp());
					statement.setInt(2, msg.getSensorId());
					statement.setFloat(3, msg.getPrimaryData());
					if (msg.hasSecondaryData()) {
						statement.setFloat(4, msg.getSecondaryData());
					} else {
						statement.setNull(4, Types.FLOAT);
					}
				},
				JdbcExecutionOptions.builder()
					.withBatchIntervalMs(1000)
					.withBatchSize(1)
					.withMaxRetries(5)
					.build(),
				new JdbcConnectionOptions.JdbcConnectionOptionsBuilder()
				 .withUrl(dbConf.url)
				 .withDriverName(dbConf.driver)
				 .withUsername(dbConf.user)
				 .withPassword(dbConf.password)
				 .build()
     		)
		);

		env.execute("Datastream Processor");
	}
}
