(() => {
  document.querySelector('#submit-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.querySelector('#pet-name').value.trim();
    if (!name) return;
    const description = document.querySelector('#pet-description').value.trim();
    const body = `## Питомец\n${name}\n\n## Описание\n${description}\n\n## Рисунок\nПрикрепите сюда готовый PNG.\n\n## Подтверждение\nЯ подтверждаю, что имею права на рисунок и принимаю условия публикации: https://artemnuhka.github.io/kamputa-browser/terms.html`;
    const query = new URLSearchParams({title:'Питомец: '+name, body});
    window.open('https://github.com/Artemnuhka/kamputa-browser/issues/new?'+query,'_blank','noopener');
  });
})();
