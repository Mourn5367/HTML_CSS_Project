const api_key = "yOvnV8S9LBzTVGvmEqSs4LnFIo9IluHT";
let inputdata = "";
let itemIds = [];
let trueItems = [];
let tempItemid = "";
let savedItemIds = [];

function getCookie(cookieName) {
    const cookies = document.cookie;
    const cookieArray = cookies.split(';');
    for (let cookie of cookieArray) {
        const [name, value] = cookie.trim().split('=');
        if (name === cookieName) {
            return JSON.parse(decodeURIComponent(value));
        }
    }
    return [];
}

// 쿠키에서 savedItemIds 초기화
savedItemIds = getCookie('savedItemIds');
console.log(savedItemIds);
function searchId() {
    itemIds.length = 0;
    trueItems.length = 0;
    inputdata = document.querySelector('input[name="searchText"]').value;
    const url = `https://api.neople.co.kr/df/items?itemName=${inputdata}&wordType=full&limit=100&apikey=${api_key}`;
    axios
        .get(url)
        .then((response) => {
            console.log(response.data)
            const itemRows = response.data["rows"];
            itemIds = itemRows.map(item => item.itemId);
            searchHistory();
        })
        .catch((error) => {
            console.log(error)
        });
}
function toggleModal(itemName, itemId) {
    tempItemid = itemId; // 선택된 아이템 ID 저장
    const modalContainer = document.querySelector('.modal_container');
    const modalText = document.getElementById('modal_text');
    modalText.textContent = `${itemName}을(를) 추가하시겠습니까?`; // 모달 내용 업데이트
    modalContainer.style.display = "block"; // 모달 보이기
}

// 모달 닫기 함수
function closeModal() {
    const modalContainer = document.querySelector('.modal_container');
    modalContainer.style.display = "none"; // 모달 숨기기
}

// 추가하기 버튼 클릭 시 실행할 함수
function addItem() {
    // 중복 아이템 체크
    if (!savedItemIds.includes(tempItemid)) {
        savedItemIds.push(tempItemid); // 중복되지 않으면 배열에 추가
        console.log(savedItemIds);

        // 쿠키에 저장
        document.cookie = `savedItemIds=${JSON.stringify(savedItemIds)}; max-age=${60 * 60 * 24 * 7}`;
    }

    closeModal(); // 모달 닫기
}

function searchHistory() 
{
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = ''; // 기존 내용을 지움
    //console.log(itemIds);

    itemIds.forEach(history => {
    const url = `https://api.neople.co.kr/df/auction?itemId=${history}&wordType=match&wordShort=true&sort=unitPrice:asc&limit=1&apikey=${api_key}`;
    axios
    .get(url)
    .then((response) => {
        const rows = response.data["rows"];
        if (rows && rows.length > 0 && rows[0]["itemId"] != null) {
            rows.forEach(row => {
                trueItems.push({
                    "아이템 아이콘": `https://img-api.neople.co.kr/df/items/${row.itemId}`,
                    "아이템 이름": row.itemName,
                    "평균가": row.averagePrice,
                    "최저가": row.unitPrice,
                });
                console.log(rows);
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td><img src="https://img-api.neople.co.kr/df/items/${row.itemId}" alt="${row.itemName} 아이콘"></td>
                    <td>${row.itemName}</td>
                    <td>${row.unitPrice}</td>
                    <th><button class="add_item" type="button" onclick="toggleModal('${row.itemName}', '${row.itemId}')"></button></th>
                `
                tableBody.appendChild(newRow);
            });
        } else {
            console.error('No valid items found for history:', history);
        }
    })
    .catch((error) => {
        console.error('Error:', error.response ? error.response.data : error.message);
    });
});
}

function handleFormSubmit(event) {
    event.preventDefault(); // 폼 제출을 막음
    searchId(); // 검색 버튼 클릭
}

