defmodule WyeNotion.Repo.Migrations.CreatePages do
  use Ecto.Migration

  def change do
    create table(:pages) do
      add :slug, :string, null: false
      add :content, :string

      timestamps(type: :utc_datetime)
    end

    create unique_index(:pages, [:slug])
  end
end
