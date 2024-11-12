defmodule WyeNotion.PageContent do
  @moduledoc """
  Handles the runtime for the content CRDT associated to a page
  """
  defstruct [:state_as_update, :slug]

  def new(%WyeNotion.Page{state_as_update: state_as_update, slug: slug}) do
    %__MODULE__{
      slug: slug,
      state_as_update: state_as_update
    }
  end

  def slug(page_data) do
    page_data.slug
  end

  def add_stringified_update(
        %__MODULE__{state_as_update: state_as_update} = page_data,
        stringified_update
      ) do
    parsed_incoming_update = string_to_y_bytes(stringified_update)

    new_state_as_update =
      if is_nil(state_as_update) do
        parsed_incoming_update
      else
        ydoc = Yex.Doc.new()

        Yex.apply_update(ydoc, state_as_update)
        Yex.apply_update(ydoc, parsed_incoming_update)

        {:ok, new_state_as_update} = Yex.encode_state_as_update(ydoc)
        new_state_as_update
      end

    %__MODULE__{
      page_data
      | state_as_update: new_state_as_update
    }
  end

  def state_as_stringified_update(%__MODULE__{state_as_update: state_as_update}),
    do: y_bytes_to_string(state_as_update)

  defp y_bytes_to_string(mybytestr) do
    String.codepoints(mybytestr)
    |> Enum.flat_map(fn s ->
      for <<x::8 <- s>>, do: x
    end)
    |> Enum.join(",")
  end

  defp string_to_y_bytes(mystr),
    do:
      String.split(mystr, ",")
      |> Enum.map(&String.to_integer/1)
      |> Enum.map(fn x -> <<x>> end)
      |> Enum.reverse()
      |> Enum.reduce(fn x, acc -> x <> acc end)
end
