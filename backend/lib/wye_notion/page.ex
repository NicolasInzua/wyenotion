defmodule WyeNotion.Page do
  @moduledoc """
  Ecto model for a page/document
  """

  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query

  alias WyeNotion.Repo
  alias WyeNotion.Page

  schema "pages" do
    field(:slug, :string)
    field(:content, :string)
    field(:state_as_update, :binary)

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(page, attrs) do
    page
    |> cast(attrs, [:slug, :content])
    |> validate_required([:slug])
    |> unique_constraint(:slug)
  end

  def insert_or_get(slug) do
    %Page{}
    |> changeset(%{"slug" => slug})
    |> Repo.insert(conflict_target: [:slug], on_conflict: {:replace, [:slug]}, returning: true)
  end

  def insert_or_get!(slug) do
    %Page{}
    |> changeset(%{"slug" => slug})
    |> Repo.insert(conflict_target: [:slug], on_conflict: {:replace, [:slug]}, returning: true)
    |> then(fn {:ok, page} -> page end)
  end

  def update_content(slug, content) do
    {affected_rows, _} =
      Page
      |> where(slug: ^slug)
      |> update(set: [content: ^content])
      |> Repo.update_all([])

    {:ok, affected_rows: affected_rows}
  end

  def update_state_as_update(slug, state_as_update) do
    {affected_rows, _} =
      Page
      |> where(slug: ^slug)
      |> update(set: [state_as_update: ^state_as_update])
      |> Repo.update_all([])

    {:ok, affected_rows: affected_rows}
  end
end
