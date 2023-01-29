package utils;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class RabbitMqConfig {

    public String host;
    public String user;
    public String password;
    public String virtualHost;
    public Integer port;
    private static RabbitMqConfig instance = null;
    private RabbitMqConfig()  {
        try (InputStream input = new FileInputStream("src/main/resources/rabbitmq.properties")) {
            Properties prop = new Properties();
            prop.load(input);

            this.host = prop.getProperty("rabbitmq.host");
            this.user = prop.getProperty("rabbitmq.username");
            this.password = prop.getProperty("rabbitmq.password");
            this.port = Integer.valueOf(prop.getProperty("rabbitmq.port"));
            this.virtualHost = prop.getProperty("rabbitmq.virtual-host");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static RabbitMqConfig getInstance()  {
        if (instance == null)
            instance = new RabbitMqConfig();
        return instance;
    }
}
