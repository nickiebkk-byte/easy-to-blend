'use strict';
const food = window.BLEND_DATA.food;
const recipes = window.BLEND_DATA.recipes;
const categoryNames = {balance:'คุมของว่าง',protein:'เพิ่มโปรตีน',plants:'เพิ่มผักผลไม้'};
let profileSubmitted = false;
function nutrition(items){return items.reduce((tot,[key,amount])=>{food[key].slice(1).forEach((value,i)=>tot[i]+=value*amount/100);return tot;},[0,0,0,0]);}
function allergens(recipe){const keys=recipe.items.map(([k])=>k);return [...(keys.some(k=>['milk','yogurt','greek'].includes(k))?['นมวัว']:[]),...(keys.includes('soy')?['ถั่วเหลือง']:[]),...(keys.includes('oats')?['ข้าวโอ๊ต']:[])];}
function compatible(recipe){const restriction=document.querySelector('#avoid').value;if(document.querySelector('#special').checked||restriction==='other')return false;const a=allergens(recipe);return !(restriction==='milk'&&a.includes('นมวัว'))&&!(restriction==='soy'&&a.includes('ถั่วเหลือง'));}
function photoStyle(recipe){return `background-image:url('assets/recipes-${recipe.category}.png');background-position:${(recipe.index%5)*25}% ${recipe.index>=5?100:0}%`;}
function openRecipe(id){
 const r=recipes.find(x=>x.id===id);if(!r)return;
 if(!compatible(r)){showRecipe();document.querySelector('#saved-message').textContent='สูตรนี้ไม่ตรงกับข้อจำกัดอาหารที่เลือก กรุณาแก้ไขข้อมูลหรือปรึกษานักกำหนดอาหารก่อน';return;}
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
 currentRecipeId=r.id;updateSaveButton();ready=true;go('result');
}
