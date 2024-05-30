import { createLocalStorageAlkosto } from './localStorage';

const {getAll, onRemove } = createLocalStorageAlkosto({
    key: 'searchProduct',
    limit: 5,
  })


export const recentProductPlugin = {
    getSources() {
      return [
        {
          sourceId: 'recentProductPlugin',
          getItems({ query }) {
            return getAll();
          },
          templates: {
            item(params) {
                const { item, html } = params;
                return html`
                <div class="tarjeta">
                <div class="info">
                  <p><strong>Nombre:</strong> <span id="nombre">${item.name}</span></p>
                  <p><strong>Imagen:</strong> <img src=${item.urlimagen} alt=${item.alt} width="40" height="40" /></p>
                </div> 
               </div>
                `;
              },
          
          },
        },
      ];
    },
  };