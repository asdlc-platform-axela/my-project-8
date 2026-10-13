import ballerina/os;

// Each setting reads the platform-injected env var and falls back to a default,
// so the service starts with none set.
configurable string dbHost = envOr("CLAIMS_DB_HOST", "localhost");
configurable string dbPort = envOr("CLAIMS_DB_PORT", "5432");
configurable string dbName = envOr("CLAIMS_DB_DBNAME", "claims");
configurable string dbUser = envOr("CLAIMS_DB_USER", "postgres");
configurable string dbPassword = envOr("CLAIMS_DB_PASSWORD", "");

function envOr(string name, string fallback) returns string {
    string value = os:getEnv(name);
    return value == "" ? fallback : value;
}
