defmodule WyeNotion.Repo.Migrations.PageContentStringToText do
  use Ecto.Migration

  def change do
    alter table(:pages) do
      modify(:content, :text, from: :string)
    end
  end
end
