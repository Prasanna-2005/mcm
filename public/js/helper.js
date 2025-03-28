// LOGIN - REGISTER
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("Please enter a valid email.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        try {
            const response = await fetch("/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, username, password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("User registered successfully!");
                window.location.href = "/login"; // Redirect to login page if needed
            } else {
                alert(data.error || "Registration failed.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong. Please try again.");
        }
    });
});
//****************************************************************************************** */
// DB-MANAGER
document.addEventListener("DOMContentLoaded", fetchTables);

function fetchTables() {
    fetch('/get-tables')
        .then(response => response.json())
        .then(data => {
            const tableList = document.getElementById('tableList');
            tableList.innerHTML = ''; // Clear existing content
            data.tables.forEach(table => {
                tableList.innerHTML += `
                    <label class="flex items-center space-x-2">
                        <input type="checkbox" class="table-checkbox" value="${table}">
                        <span>${table}</span>
                    </label>
                `;
            });
        })
        .catch(error => console.error('Error fetching tables:', error));
}

function fetchTableData() {
    const selectedTables = Array.from(document.querySelectorAll('.table-checkbox:checked'))
        .map(cb => cb.value);
    if (selectedTables.length === 0) {
        alert("Please select at least one table.");
        return;
    }

    fetch('/get-table-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tables: selectedTables })
    })
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('tableDataContainer');
            container.innerHTML = '';
            data.forEach(tableData => {
                container.innerHTML += `
                <h3 class="text-lg font-bold mt-4">${tableData.table}</h3>
                <table class="w-full border-collapse border border-gray-300 mt-2">
                    <thead>
                        <tr class="bg-gray-200">
                            ${tableData.columns.map(col => `<th class="border p-2">${col}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${tableData.rows.map(row => `
                            <tr class="bg-white border">
                                ${Object.values(row).map(value => `<td class="border p-2">${value}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            });
        })
        .catch(error => console.error('Error fetching table data:', error));
}