const api_key = "yOvnV8S9LBzTVGvmEqSs4LnFIo9IluHT";

let savedItemIds = [];

// 쿠키에서 저장된 아이템 ID 배열을 가져옵니다.
function getCookie(cookieName) {
    const cookies = document.cookie;
    const cookieArray = cookies.split(';');

    for (let cookie of cookieArray) {
        const [name, value] = cookie.trim().split('=');
        if (name === cookieName) {
            return decodeURIComponent(value);
        }
    }
    
    return undefined;
}

// 쿠키를 설정하는 함수입니다.
function setCookie(cookieName, cookieValue, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${cookieName}=${encodeURIComponent(cookieValue)}; ${expires}; path=/`;
}

// 쿠키를 삭제하는 함수입니다.
function deleteCookie(cookieName) {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/templates`;
}

// 초기 쿠키 데이터를 가져옵니다.
const savedItemIdsString = getCookie('savedItemIds');
if (savedItemIdsString) {
    savedItemIds = JSON.parse(savedItemIdsString);
}
console.log(savedItemIds);

window.onload = function() {
    searchHistory();
}

function searchHistory() {
    let count = 1;
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = ''; // 기존 내용을 지웁니다.
    console.log(savedItemIds);

    savedItemIds.forEach(itemid => {
        const url = `https://api.neople.co.kr/df/auction?itemId=${itemid}&wordType=match&wordShort=true&sort=unitPrice:asc&limit=1&apikey=${api_key}`;
        console.log(url);

        axios
            .get(url)
            .then((response) => {
                const rows = response.data["rows"];
                if (rows && rows.length > 0 && rows[0]["itemId"] != null) {
                    rows.forEach(row => {
                        const newRow = document.createElement('tr');
                        count++;
                        newRow.innerHTML = `
                            <td><input type="checkbox" class="check" id="check${count}"><label for="check${count}"></label></td>
                            <td><img src="https://img-api.neople.co.kr/df/items/${row.itemId}" alt="${row.itemName} 아이콘"></td>
                            <td>${row.itemName}</td>
                            <td>${row.averagePrice}</td>
                            <td>${row.unitPrice}</td>
                            <th><button class="delete" onclick="removeItem('${row.itemId}')"></button></th>
                        `;
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

function removeItem(itemId) {
    // 해당 아이템 ID를 배열에서 제거
    savedItemIds = savedItemIds.filter(id => id !== itemId);
    deleteCookie('savedItemIds');
    // 업데이트된 배열을 쿠키에 저장
    setCookie('savedItemIds', JSON.stringify(savedItemIds), 7);

    // 테이블에서 해당 행을 제거
    searchHistory(); // 테이블을 다시 렌더링

    console.log('Updated savedItemIds after deletion:', savedItemIds);
}
