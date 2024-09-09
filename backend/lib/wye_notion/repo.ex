defmodule WyeNotion.Repo do
  use Ecto.Repo,
    otp_app: :wye_notion,
    adapter: Ecto.Adapters.Postgres
end
