document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("form").forEach(form => {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const textarea = form.querySelector('textarea');

            if (!textarea.value.trim()) {
                alert("Пожалуйста, введите данные!");
                return;
            }

            const submitButton = form.querySelector('button');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = "Обработка...";

            const formData = new FormData(form);
            const action = form.getAttribute("action");

            fetch(action, {
                method: "POST",
                body: formData
            })
                .then(response => response.text())
                .then(data => {
                    document.body.innerHTML = data;
                })
                .catch(error => {
                    console.error("Ошибка:", error);
                    alert("Произошла ошибка при обработке запроса");
                })
                .finally(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                });
        });
    });
});