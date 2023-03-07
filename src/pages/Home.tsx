import React, { ChangeEvent, useEffect, useState } from "react"
import { Container, Grid, InputAdornment, TextField, Typography, Box, Button, IconButton } from "@mui/material"
import PokemonCard from "../components/PokemonCard"
import { Field, usePokemonContext, PokemonType, PokemonTypeData } from "../components/Contexts/PokemonProvider"
import { Search, FavoriteBorder, Favorite, Close } from "@mui/icons-material"
import PokemonFilterTypes from "../components/PokemonFilterTypes"
import PokeAPI, { INamedApiResource, IPokemon } from "pokeapi-typescript"

interface IPokemonWithUrl extends IPokemon {
  url: string;
}

const Home: React.FC = () => {
  const {
    pokemon,
    query,
    search,
    favourites,
    addFavourite,
    removeFavourite,
    filters,
    addFilter,
    removeFilter,
  } = usePokemonContext()

  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<IPokemonWithUrl[]>([]);
  const allTypes: PokemonTypeData[] = Object.values(PokemonType).map((type) => ({
    name: type  
  }));

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    search(event.target.value)
  }

  const handleToggleFavourites = () => {
    if (filters[Field.favourite]) {
      removeFilter(Field.favourite)
    } else {
      addFilter(Field.favourite, true)
    }
  }

  function addSelectedType(type: PokemonType) {
    setSelectedTypes([...selectedTypes, type]);
  }

  function removeSelectedType(type: PokemonType) {
    setSelectedTypes(selectedTypes.filter((current_type)=> current_type !== type));
  }
  
  //fetch all pokemon and update based on type selected
  const fetchPokemonDetails = async (pokemonList: INamedApiResource<IPokemon>[]) => {
    const promises = pokemonList.map(async (pokemon) => {
      const name = pokemon.name[0].toUpperCase() + pokemon.name.slice(1);
      const res = await PokeAPI.Pokemon.resolve(name);
      const types = res.types.map((type) => type.type.name);
      if (selectedTypes.length < 1) {
        return { ...res, url: pokemon.url }
      }
      else if (selectedTypes.some((element) => types.includes(element))) {
        return { ...res, url: pokemon.url }
      }
    });
  
    const pokemonDetailsList = await Promise.all(promises);
    const filteredPokemonList = pokemonDetailsList.filter((pokemon) => pokemon !== undefined) as IPokemonWithUrl[];
    setFilteredPokemon(filteredPokemonList);
  };

  // update filtered list
  useEffect(() => {
    fetchPokemonDetails(pokemon);
  }, [pokemon, selectedTypes])

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Typography variant="h1">What Pokemon <br/>are you looking for?</Typography>
      <Box
        sx={{
          display: "flex",
          pt: 4,
          pb: 2
        }}
      >
        <TextField
          id="pokemon-search"
          placeholder="Search Pokemon"
          variant="outlined"
          value={query}
          onChange={handleQueryChange}
          InputProps={{
            sx: { pr: 0 },
            startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
            endAdornment: <InputAdornment position="end">
              <IconButton onClick={() => search("")}><Close /></IconButton>
            </InputAdornment>
          }}
        />


        <Button
          startIcon={filters[Field.favourite]
            ? <Favorite />
            : <FavoriteBorder />
          }
          color={filters[Field.favourite] ? "primary" : "secondary"}
          sx={{
            flexShrink: 0,
            ml: "2rem"
          }}
          onClick={handleToggleFavourites}
        >
          My Favourites ({favourites.length})
        </Button>
      </Box>

      <PokemonFilterTypes
        allTypes={allTypes}
        selectedTypes={selectedTypes}
        addFilterType={addSelectedType}
        removeFilterType={removeSelectedType}
      />

      <Grid container spacing={2}>
      {filteredPokemon.map((pokemon) => {
          return (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={pokemon.name}
              >
                <PokemonCard
                  pokemon={pokemon}
                  isFavourite={favourites.includes(pokemon.name)}
                  onAddFavourite={() => addFavourite(pokemon)}
                  onRemoveFavourite={() => removeFavourite(pokemon)}
                  selectedTypes={selectedTypes}
                />
              </Grid>
            )
          }
        )
      }

      </Grid>
    </Container>
  )
}

export default Home