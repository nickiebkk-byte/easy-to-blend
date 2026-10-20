'use strict';
const food = window.BLEND_DATA.food;
const recipes = window.BLEND_DATA.recipes;
const categoryNames = {balance:'คุมของว่าง',protein:'เพิ่มโปรตีน',plants:'เพิ่มผักผลไม้'};
let catalogCategory = 'all';
let profileSubmitted = false;
function nutrition(items){return items.reduce((tot,[key,amount])=>{food[key].slice(1).forEach((value,i)=>tot[i]+=value*amount/100);return tot;},[0,0,0,0]);}
function allergens(recipe){const keys=recipe.items.map(([k])=>k);return [...(keys.some(k=>['milk','yogurt','greek'].includes(k))?['นมวัว']:[]),...(keys.includes('soy')?['ถั่วเหลือง']:[]),...(keys.includes('oats')?['ข้าวโอ๊ต']:[])];}
function compatible(recipe){const restriction=document.querySelector('#avoid').value;if(document.querySelector('#special').checked||restriction==='other')return false;const a=allergens(recipe);return !(restriction==='milk'&&a.includes('นมวัว'))&&!(restriction==='soy'&&a.includes('ถั่วเหลือง'));}
function photoStyle(recipe){return `background-image:url('assets/recipes-${recipe.category}.png');background-position:${(recipe.index%5)*25}% ${recipe.index>=5?100:0}%`;}
function chooseCategory(cat){catalogCategory=cat;renderCatalog();}
function renderCatalog(){
 const query=document.querySelector('#recipe-search').value.trim().toLocaleLowerCase('th');
 document.querySelector('#category-tabs').innerHTML=[['all','ทั้งหมด',30],...Object.entries(categoryNames).map(([k,v])=>[k,v,10])].map(([k,v,n])=>`<button class="${catalogCategory===k?'selected':''}" aria-pressed="${catalogCategory===k}" onclick="chooseCategory('${k}')">${v} ${n}</button>`).join('');
 const eligible=recipes.filter(r=>(catalogCategory==='all'||r.category===catalogCategory)&&compatible(r));
 const matches=eligible.filter(r=>(r.name+' '+r.items.map(([k])=>food[k][0]).join(' ')).toLocaleLowerCase('th').includes(query));
 const avoid=document.querySelector('#avoid').value;
 document.querySelector('#catalog-status').textContent=`แสดง ${matches.length} สูตร จากทั้งหมด 30 สูตร`+(avoid==='milk'?' • คัดสูตรที่ไม่มีส่วนผสมนมวัว':avoid==='soy'?' • คัดสูตรที่ไม่มีส่วนผสมถั่วเหลือง':'');
 document.querySelector('#recipe-list').innerHTML=matches.length?matches.map(r=>{const n=nutrition(r.items);const a=allergens(r);return `<button class="recipe-card" onclick="openRecipe('${r.id}')" aria-label="${r.name} ประมาณ ${Math.round(n[0])} กิโลแคลอรีต่อแก้ว"><span class="recipe-photo" role="img" aria-label="ภาพประกอบ ${r.name}" style="${photoStyle(r)}"></span><span class="recipe-info"><small>${categoryNames[r.category]} / ${String(r.index+1).padStart(2,'0')}</small><b>${r.name}</b><span class="kcal">${Math.round(n[0])} <small>kcal / แก้ว ↗</small></span><small class="allergen">${a.length?'มี: '+a.join(' · '):'ไม่ใส่นมวัวและถั่วเหลือง'}</small></span></button>`;}).join(''):`<div class="catalog-alert">${document.querySelector('#special').checked||avoid==='other'?'ข้อจำกัดที่เลือกยังไม่อยู่ในขอบเขตสูตรอัตโนมัติ กรุณาให้นักกำหนดอาหารช่วยเลือกสูตรเฉพาะบุคคล':'ไม่พบสูตรตามเงื่อนไขนี้ ลองเปลี่ยนคำค้นหรือหัวข้อสูตร'}</div>`;
}
function openRecipe(id){
 const r=recipes.find(x=>x.id===id);if(!r)return;
 if(!compatible(r)){showRecipe();return;}
 const sums=nutrition(r.items);
 document.querySelector('#recipe-title').textContent=r.name;
 document.querySelector('#recipe-sub').textContent='1 สูตร = 1 แก้ว • '+categoryNames[r.category]+(profileSubmitted?' • '+document.querySelector('#time').value:'');
 const image=document.querySelector('#result-art');image.innerHTML='';image.className='art recipe-photo';image.setAttribute('role','img');image.setAttribute('aria-label','ภาพประกอบ '+r.name);image.setAttribute('style',photoStyle(r));
 document.querySelector('#why').textContent='สูตรนี้ช่วยอะไร? '+r.benefit;
 document.querySelector('#calorie-hero').innerHTML=`<strong style="font-size:48px;line-height:1">${Math.round(sums[0])}</strong> <b>kcal / แก้ว</b><div class="note">พลังงานโดยประมาณ • ไม่เติมน้ำตาล</div>`;
 document.querySelector('#ingredients').innerHTML=r.items.map(([k,q])=>`<div class="row"><span>${food[k][0]}</span><b style="text-align:right;flex-shrink:0">${q} ${['water','soy','milk','lime'].includes(k)?'มล.':'กรัม'}<small style="display:block;color:var(--muted);font-weight:400">≈ ${Math.round(food[k][1]*q/100)} kcal</small></b></div>`).join('');
 document.querySelector('#nutrients').innerHTML=sums.map((v,i)=>`<div><strong>${i===0?Math.round(v):v.toFixed(1)}</strong><small>${['kcal','โปรตีน (ก.)','น้ำตาล (ก.)','ใยอาหาร (ก.)'][i]}</small></div>`).join('');
 document.querySelector('#recipe-method').innerHTML=`<li>${r.prep}</li><li>เติมของเหลวก่อน ตามด้วยส่วนผสมอื่น ปั่นตามคู่มือเครื่องจนได้เนื้อที่ชอบ หากข้นเกินไปเติมน้ำสะอาดเล็กน้อย</li><li>ไม่กรองกาก แบ่งเป็น 1 แก้วและดื่มทันที หากต้องการเติมน้ำแข็ง ต้องตรวจว่าเครื่องรองรับการบดน้ำแข็ง</li>`;
 let text='สูตรทั่วไปสำหรับผู้ใหญ่ • เลือกปริมาณให้เหมาะกับอาหารทั้งวัน ตรวจฉลากวัตถุดิบและอาหารที่แพ้ก่อนทำ';
 if(profileSubmitted){const sex=document.querySelector('#sex').value;if(sex!=='none'){const bmr=10*Number(document.querySelector('#weight').value)+6.25*Number(document.querySelector('#height').value)-5*Number(document.querySelector('#age').value)+(sex==='male'?5:-161);const daily=bmr*Number(document.querySelector('#activity').value);text='พลังงานรักษาน้ำหนักโดยประมาณ '+(Math.round(daily/50)*50).toLocaleString()+' kcal/วัน • สมการ Mifflin–St Jeor คูณระดับกิจกรรม เป็นค่าประมาณ ไม่ใช่เป้าลดน้ำหนัก แก้วนี้ประมาณ '+Math.round(sums[0])+' kcal ให้นับรวมกับอาหารทั้งวัน';}}
 const a=allergens(r);document.querySelector('#energy').textContent=text+(a.length?' • ส่วนผสมที่ควรตรวจเรื่องการแพ้: '+a.join(', '):'');
 ready=true;go('result');
}
document.querySelector('#profile-form').addEventListener('submit',e=>{e.preventDefault();const err=document.querySelector('#error');if(document.querySelector('#special').checked||document.querySelector('#avoid').value==='other'){err.textContent='สูตรอัตโนมัติยังไม่ครอบคลุมข้อจำกัดนี้ กรุณาให้นักกำหนดอาหารช่วยเลือกสูตรเฉพาะบุคคลก่อน';return;}err.textContent='';profileSubmitted=true;catalogCategory=goal;document.querySelector('#recipe-search').value='';renderCatalog();go('catalog');});
renderCatalog();
