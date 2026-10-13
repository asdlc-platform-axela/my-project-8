import ballerina/log;
import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;

// The client is created lazily so the service starts even when the database is
// not reachable yet; the schema is created idempotently on first successful connect.
postgresql:Client? dbClient = ();
boolean schemaReady = false;

public function initDb() returns postgresql:Client|error {
    lock {
        postgresql:Client? existing = dbClient;
        if existing is postgresql:Client && schemaReady {
            return existing;
        }
    }
    int port = check int:fromString(dbPort);
    postgresql:Client db = check new (host = dbHost, username = dbUser, password = dbPassword,
        database = dbName, port = port);
    check createSchema(db);
    lock {
        dbClient = db;
        schemaReady = true;
    }
    return db;
}

// Returns the ready database client, connecting and creating the schema if needed.
public function getDb() returns postgresql:Client|error {
    return initDb();
}

// Startup attempt: a failure is logged, not fatal; getDb() retries on first use.
function startupSchema() {
    postgresql:Client|error db = initDb();
    if db is error {
        log:printWarn("claims-db not ready at startup; schema creation will retry on first use", 'error = db);
    }
}

final () dbStartup = startupSchema();

function createSchema(postgresql:Client db) returns error? {
    _ = check db->execute(`
        CREATE TABLE IF NOT EXISTS claims (
            id TEXT PRIMARY KEY,
            owner_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
            policy_number TEXT NOT NULL DEFAULT '',
            vehicle_reg_number TEXT NOT NULL DEFAULT '',
            claim_number TEXT UNIQUE,
            insured_name TEXT,
            insured_address TEXT,
            insured_phone TEXT,
            insured_fax TEXT,
            bank_name TEXT,
            bank_account_number TEXT,
            owner_name TEXT,
            owner_address TEXT,
            finance_institution TEXT,
            driver_name TEXT,
            driver_age INTEGER,
            driver_relationship TEXT,
            driver_licence_number TEXT,
            accident_date DATE,
            accident_time TEXT,
            accident_location TEXT,
            police_station TEXT,
            accident_description TEXT,
            usage TEXT CHECK (usage IN ('private', 'hire', 'self-drive', 'tuition', 'other')),
            goods_damaged BOOLEAN,
            goods_description TEXT,
            goods_value NUMERIC,
            passenger_injured BOOLEAN,
            injured_passenger_details TEXT,
            third_party_injured BOOLEAN,
            third_party_injury_details TEXT,
            third_party_property_damaged BOOLEAN,
            third_party_property_details TEXT,
            other_insurance BOOLEAN,
            other_insurance_details TEXT,
            declaration_accepted BOOLEAN,
            submitted_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`);
    _ = check db->execute(`
        CREATE INDEX IF NOT EXISTS claims_owner_idx ON claims (owner_id, updated_at DESC)`);
    _ = check db->execute(`
        CREATE TABLE IF NOT EXISTS attachments (
            id TEXT PRIMARY KEY,
            claim_id TEXT NOT NULL REFERENCES claims (id) ON DELETE CASCADE,
            type TEXT NOT NULL CHECK (type IN ('driving-licence', 'bank-page')),
            file_name TEXT NOT NULL,
            content_type TEXT NOT NULL,
            content BYTEA NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`);
    _ = check db->execute(`
        CREATE INDEX IF NOT EXISTS attachments_claim_idx ON attachments (claim_id)`);
    _ = check db->execute(`CREATE SEQUENCE IF NOT EXISTS claim_number_seq`);
}
