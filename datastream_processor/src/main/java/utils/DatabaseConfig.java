package utils;

import java.io.*;
import java.util.Properties;

public class DatabaseConfig {
    public String url;
    public String user;
    public String password;
    public String driver;
    private static DatabaseConfig instance = null;
    private DatabaseConfig()  {
        try (InputStream input = new FileInputStream("src/main/resources/database.properties")) {
            Properties prop = new Properties();
            prop.load(input);

            this.url = prop.getProperty("db.url");
            this.user = prop.getProperty("db.username");
            this.password = prop.getProperty("db.password");
            this.driver = prop.getProperty("db.driver-class-name");
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static DatabaseConfig getInstance()  {
        if (instance == null)
            instance = new DatabaseConfig();
        return instance;
    }

}
