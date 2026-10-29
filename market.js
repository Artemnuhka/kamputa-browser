(() => {
 const status=document.querySelector('#market-status'),grid=document.querySelector('#market-grid'),tabs=[...document.querySelectorAll('[data-category]')];
 let items=[],selected='pets';
 const messages={pets:'Питомцы скоро появятся здесь.',clothes:'Одежда скоро появится здесь.',owned:'Твои покупки появятся здесь, когда откроется маркетплейс.'};
 function card(item){
  const box=document.createElement('article');box.className='market-card';
  const image=document.createElement('div');image.className='market-card-image';
  const sprite=document.createElement('span');sprite.className='catalog-cat';sprite.setAttribute('aria-hidden','true');image.append(sprite);
  const content=document.createElement('div');content.className='market-card-content';
  const name=document.createElement('h2');name.textContent=item.name;
  const desc=document.createElement('p');desc.textContent=item.description;
  const badge=document.createElement('span');badge.className='market-badge';badge.textContent='Питомец браузера';
  content.append(name,desc,badge);box.append(image,content);return box;
 }
 function show(category){selected=category;tabs.forEach(t=>t.setAttribute('aria-selected',String(t.dataset.category===category)));grid.replaceChildren();const visible=category==='owned'?[]:items.filter(item=>item.category===category);status.textContent=visible.length?'':messages[category];visible.forEach(item=>grid.append(card(item)));}
 tabs.forEach(tab=>tab.addEventListener('click',()=>show(tab.dataset.category)));
 fetch('catalog.json').then(response=>{if(!response.ok)throw new Error('catalog');return response.json();}).then(data=>{items=Array.isArray(data.items)?data.items.filter(item=>item.id==='default-cat'):[];show(selected);}).catch(()=>{status.textContent='Не удалось открыть каталог. Попробуй обновить страницу.';});
})();
