
fetch('https://api.vvhan.com/api/visitor.info')
    .then(response => response.json())
    .then(data => {
        const wow = document.createElement('div')
        wow.className = 'bg-white p-4 rounded-lg shadow-md mb-4 flex items-center';
        wow.innerHTML = `<h3 class="font-bold rilo-text">访客信息</h3><p>${data['location']}${data['week']}  ${data['tq']}</p><p>${data['tip']}</p>`;
        document.querySelector('aside').appendChild(wow);
    })
