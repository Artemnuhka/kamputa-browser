const status = document.querySelector('#market-status');
const tabs = document.querySelectorAll('[data-category]');
const messages = {pets:'Питомцы скоро появятся здесь.',clothes:'Одежда скоро появится здесь.',owned:'Твои покупки появятся здесь, когда откроется маркетплейс.'};
function show(category){tabs.forEach(t=>t.setAttribute('aria-selected',String(t.dataset.category===category)));status.textContent=messages[category];}
tabs.forEach(tab=>tab.addEventListener('click',()=>show(tab.dataset.category)));
show('pets');
