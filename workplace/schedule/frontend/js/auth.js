// =======================================
// auth.js
// ログイン・新規登録
// =======================================


// =======================================
// 新規登録
// =======================================

const registerForm =
    document.getElementById("registerForm");


if(registerForm){

    registerForm.addEventListener(
        "submit",
        function(event){

            event.preventDefault();


            const name =
                document.getElementById(
                    "registerName"
                ).value.trim();


            const email =
                document.getElementById(
                    "registerEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "registerPassword"
                ).value;


            const error =
                document.getElementById(
                    "registerError"
                );


            // 現在のユーザー一覧
            const users =
                JSON.parse(
                    localStorage.getItem("users")
                ) || [];


            // メールアドレス重複チェック
            const existingUser =
                users.find(
                    user =>
                        user.email === email
                );


            if(existingUser){

                error.textContent =
                    "このメールアドレスはすでに登録されています。";

                return;

            }


            // 新しいユーザー
            const newUser = {

                id:
                    Date.now(),

                name:
                    name,

                email:
                    email,

                // ※これは仮実装
                password:
                    password

            };


            users.push(newUser);


            localStorage.setItem(
                "users",
                JSON.stringify(users)
            );


            alert(
                "新規登録が完了しました。"
            );


            window.location.href =
                "login.html";

        }
    );

}


// =======================================
// ログイン
// =======================================

const loginForm =
    document.getElementById("loginForm");


if(loginForm){

    loginForm.addEventListener(
        "submit",
        function(event){

            event.preventDefault();


            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            const error =
                document.getElementById(
                    "loginError"
                );


            const users =
                JSON.parse(
                    localStorage.getItem("users")
                ) || [];


            const user =
                users.find(
                    user =>
                        user.email === email &&
                        user.password === password
                );


            if(!user){

                error.textContent =
                    "メールアドレスまたはパスワードが違います。";

                return;

            }


            // ログイン中のユーザーを保存
            localStorage.setItem(
                "currentUser",
                JSON.stringify(user)
            );


            // メイン画面へ
            window.location.href =
                "index.html";

        }
    );

}