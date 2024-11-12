defmodule WyeNotion.PageUserList do
  @moduledoc """
  Handles the user list associated to a page
  """
  defstruct [:users, :slug]

  def new(%WyeNotion.Page{slug: slug}) do
    %__MODULE__{
      users: MapSet.new(),
      slug: slug
    }
  end

  def add_user(%__MODULE__{users: users} = page_data, user) do
    %__MODULE__{page_data | users: MapSet.put(users, user)}
  end

  def remove_user(%__MODULE__{users: users} = page_data, user) do
    %__MODULE__{page_data | users: MapSet.delete(users, user)}
  end

  def users_here(%__MODULE__{users: users}) do
    MapSet.to_list(users)
  end

  def slug(page_data) do
    page_data.slug
  end

  def page_abandoned?(%__MODULE__{users: users}) do
    MapSet.size(users) == 0
  end
end
