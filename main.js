//import { autocomplete,getAlgoliaResults } from '@algolia/autocomplete-js';
//import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions';
//import { createLocalStorageRecentSearchesPlugin } from '@algolia/autocomplete-plugin-recent-searches';
//import algoliasearch from 'algoliasearch';
import { createLocalStorageAlkosto } from './localStorage';
import { recentProductPlugin } from './myOwnPlugin';
const { autocomplete, getAlgoliaResults } = window["@algolia/autocomplete-js"];
const { createLocalStorageRecentSearchesPlugin } = window['@algolia/autocomplete-plugin-recent-searches']
const { createQuerySuggestionsPlugin } = window['@algolia/autocomplete-plugin-query-suggestions']
require('dotenv').config();


const {onAdd} = createLocalStorageAlkosto({
  key: 'searchProduct',
  limit: 5,
})

// Configurar el cliente de Algolia
const searchClient = algoliasearch(process.env.API_ID, process.env.API_KEY);

// Configurar los plugins
const recentSearchesPlugin = createLocalStorageRecentSearchesPlugin({
  key: 'search',
  limit: 5
});



const querySuggestionsPlugin = createQuerySuggestionsPlugin({
  searchClient,
  indexName: process.env.SUGGUESTION_INDEX,
  getSearchParams() {
    return { hitsPerPage: 2 };
  },
  transformSource({ source }) {
    return {
      ...source,
      getItems(params) {
        if (!params.state.query) {
          return [];
        }

        if (params.state.query.length<3){
          return [];
        }

        return source.getItems(params);
      }

    };
  }
});

const popularPlugin = createQuerySuggestionsPlugin({
  searchClient,
  indexName: process.env.SUGGUESTION_INDEX,
  getSearchParams() {
    return { hitsPerPage: 2 };
  },
  transformSource({ source }) {
    return {
      ...source,
      sourceId: 'popularPlugin',
      getItemInputValue({ item }) {
        return item.query;
      },
      onSelect({ setIsOpen }) {
        setIsOpen(true);
      },
      getItems(params) {
  
        if (!params.state.query) {
          return source.getItems(params);
        }},
      templates: {
        item( params ) {
          const { item, html } = params;
       
            return html`
            <div className="aa-ItemWrapper">
            <div className="aa-ItemContent">
              <div className="aa-ItemContentBody">
                <div className="aa-ItemContentTitle">${item.query}</div>
              </div>
            </div>
          </div>`;
          
        },
      },
    };
  },
});

// Inicializar autocomplete



autocomplete({
  container: '#autocomplete',
  // ...
  plugins: [querySuggestionsPlugin, popularPlugin, recentSearchesPlugin, recentProductPlugin],
  openOnFocus: true,
  getSources({ query }) {
    return [
      {
        sourceId: 'products',
        getItems(params) {
  
            if (!params.state.query) {
              return [];
            }
    
            if (params.state.query.length<3){
              return [];
            }
          return getAlgoliaResults({
            searchClient,
            queries: [
              {
                indexName: process.env.SOURCE_INDEX,
                query,
                params: {
                  hitsPerPage: 5,
                },
              },
            ],
          });
        },
        templates: {
          item( params ) {
            const { item, html } = params;
              return html`<div> ${item.name_text_es} </div>`;
            
          },
        },
        // ...
      },
    ];
  },
  render({ elements, render, html, state }, root) {
    // Log the entire parameter object to see what's being passed
    const { recentSearchesPlugin, recentProductPlugin, querySuggestionsPlugin, products, popularPlugin } = elements;


    if(state.query=="" && recentProductPlugin){
      render(html`
      <div class="aa-PanelLayout aa-Panel--scrollable">
      <div class="aa-PanelSections">
        <div class="aa-PanelSection--left">
        <div class="plugin">
        ${recentSearchesPlugin}
      </div>
        <div class="aa-PanelSection--popular">
            ${popularPlugin}
          </div>
        </div>
        <div class="aa-PanelSection--right">
          <div class="plugin">
          ${recentProductPlugin}
          </div>
        </div>
        </div>
      </div>
      `, root)
      return
    }

    if (state.query==""){

      render(html`
      <div class="aa-PanelLayout aa-Panel--scrollable">
      <div class="aa-PanelSections">
      <div class="aa-PanelSection--left">
      <div class="aa-PanelSection--popular">
      ${popularPlugin}
      </div>
      </div>
      </div>
      </div>
      `, root)
      return

    }

    render(
      html`<div class="aa-PanelLayout aa-Panel--scrollable">
      <div class="aa-PanelSections">
        <div class="aa-PanelSection--left">
          <div class="plugin">
            ${recentSearchesPlugin}
          </div>
          <div class="plugin">
            ${querySuggestionsPlugin}
          </div>
        </div>
        <div class="aa-PanelSection--right">
          <div class="plugin">
          ${products}
          </div>
        </div>
        </div>
      </div>`,
      root
    );
  },
});

document.getElementById('imageForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Evitar el envío del formulario

  const name = document.getElementById('name').value;
  const urlimagen = document.getElementById('urlimagen').value;
  const alt = document.getElementById('alt').value;

  onAdd({
    name,
    urlimagen,
    alt
  });

  // Limpiar los campos del formulario
  document.getElementById('name').value = '';
  document.getElementById('urlimagen').value = '';
  document.getElementById('alt').value = '';



});

