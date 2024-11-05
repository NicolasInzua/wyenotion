defmodule WyeNotion.Repo.Migrations.AddStateAsUpdateCol do
  use Ecto.Migration

  def change do
    alter table(:pages) do
      add(:state_as_update, :binary, default: nil)
    end
  end
end
