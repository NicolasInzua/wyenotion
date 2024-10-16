import Config

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
config :wye_notion, WyeNotion.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "wye_notion_test#{System.get_env("MIX_TEST_PARTITION")}",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: System.schedulers_online() * 2

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :wye_notion, WyeNotionWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "2c/qqB6XjbsMCTjQM4cngOmigEDz97ZJxnp4JGA8DJrS6Fh+NBhVTORE726Jppdl",
  server: false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime

config :wye_notion,
  page_supervisor: WyeNotion.TestDynamicSupervisor,
  page_registry: WyeNotion.TestPageRegistry
