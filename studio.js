(() => {
  const canvas = document.querySelector('#draw');
  const ctx = canvas.getContext('2d', {willReadFrequently:true});
  const atlas = document.createElement('canvas'); atlas.width = 128; atlas.height = 192;
  const actx = atlas.getContext('2d', {willReadFrequently:true});
  const names = ['Стоит','Идёт','Спит','За ноутбуком','Ест','Радуется'];
  const list = document.querySelector('#frame-list');
  const msg = document.querySelector('#editor-message');
  let frame = 0, tool = 'pen', drawing = false, history = [];
  const coords = n => [(n % 4)*32, Math.floor(n/4)*32];
  function render() {
    const [x,y] = coords(frame); ctx.clearRect(0,0,32,32); ctx.drawImage(atlas,x,y,32,32,0,0,32,32);
    document.querySelector('#frame-label').textContent = `${names[Math.floor(frame/4)]} · кадр ${frame%4+1}`;
    list.querySelectorAll('button').forEach(b=>{const active=Number(b.dataset.frame)===frame;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  }
  names.forEach((name,row)=>{const wrap=document.createElement('div');wrap.className='frame-row';const title=document.createElement('span');title.textContent=name;wrap.append(title);for(let col=0;col<4;col++){const button=document.createElement('button');button.type='button';button.textContent=String(col+1);button.dataset.frame=String(row*4+col);button.setAttribute('aria-label',`${name}, кадр ${col+1}`);button.addEventListener('click',()=>{frame=row*4+col;render();});wrap.append(button);}list.append(wrap);});
  function snapshot(){history.push(actx.getImageData(0,0,atlas.width,atlas.height));if(history.length>30)history.shift();}
  function paint(e){const rect=canvas.getBoundingClientRect(), x=Math.floor((e.clientX-rect.left)/rect.width*32),y=Math.floor((e.clientY-rect.top)/rect.height*32);if(x<0||y<0||x>=32||y>=32)return;const [ox,oy]=coords(frame);if(tool==='eraser')actx.clearRect(ox+x,oy+y,1,1);else{actx.fillStyle=document.querySelector('#color').value;actx.fillRect(ox+x,oy+y,1,1);}render();}
  canvas.addEventListener('pointerdown',e=>{e.preventDefault();snapshot();drawing=true;canvas.setPointerCapture(e.pointerId);paint(e);});
  canvas.addEventListener('pointermove',e=>{if(drawing)paint(e);});
  canvas.addEventListener('pointerup',()=>drawing=false);canvas.addEventListener('pointercancel',()=>drawing=false);
  ['pen','eraser'].forEach(id=>document.querySelector('#'+id).addEventListener('click',()=>{tool=id;['pen','eraser'].forEach(t=>{const b=document.querySelector('#'+t);b.classList.toggle('active',t===tool);b.setAttribute('aria-pressed',String(t===tool));});}));
  document.querySelector('#undo').addEventListener('click',()=>{const previous=history.pop();if(previous){actx.putImageData(previous,0,0);render();}});
  document.querySelector('#previous-copy').addEventListener('click',()=>{if(frame===0){msg.textContent='Это первый кадр.';return;}snapshot();const [sx,sy]=coords(frame-1),[dx,dy]=coords(frame);const data=actx.getImageData(sx,sy,32,32);actx.putImageData(data,dx,dy);msg.textContent='Предыдущий кадр скопирован.';render();});
  function download(){const a=document.createElement('a');a.download='kamputa-pet.png';a.href=atlas.toDataURL('image/png');a.click();}
  document.querySelector('#export').addEventListener('click',download);
  document.querySelector('#import').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;if(file.type!=='image/png'||file.size>5*1024*1024){msg.textContent='Выбери PNG размером до 5 МБ.';return;}const url=URL.createObjectURL(file), img=new Image();img.onload=()=>{if(img.width!==128||img.height!==192){msg.textContent='Нужен шаблон размером 128 × 192 пикселя.';}else{snapshot();actx.clearRect(0,0,128,192);actx.drawImage(img,0,0);msg.textContent='Шаблон открыт.';render();}URL.revokeObjectURL(url);e.target.value='';};img.onerror=()=>{msg.textContent='Не получилось открыть картинку.';URL.revokeObjectURL(url);};img.src=url;});
  document.querySelector('#submit-form').addEventListener('submit',e=>{e.preventDefault();const name=document.querySelector('#pet-name').value.trim(),description=document.querySelector('#pet-description').value.trim();if(!name)return;download();const body=`## Питомец\n${name}\n\n## Описание\n${description}\n\n## Рисунок\nПрикрепите сюда скачанный файл kamputa-pet.png.\n\n## Подтверждение\nЯ подтверждаю, что имею права на рисунок и принимаю условия публикации: https://artemnuhka.github.io/kamputa-browser.github.io/terms.html`;
    const url='https://github.com/Artemnuhka/kamputa-browser.github.io/issues/new?'+new URLSearchParams({title:'Питомец: '+name,body});window.open(url,'_blank','noopener');document.querySelector('#submit-status').textContent='Прикрепи скачанный PNG к открывшейся заявке на GitHub и отправь её.';});
  render();
})();
