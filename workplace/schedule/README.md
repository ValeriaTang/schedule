# スケジュール管理サイト

## 概要

このプロジェクトは、[課題の可視化・共有] を実現するためのものです。[スケジュール管理機能] を備えています。


## 1.インストール(初回のみ)

## [プロジェクトの依存関係をインストールするコマンド]
### frontend フォルダに移動
cd frontend
### パッケージをインストール
npm install
### 終わったら親フォルダに戻る
cd ..

### backend フォルダに移動
cd backend
### パッケージをインストール
npm install
### 終わったら一度、親フォルダに戻る
cd ..



## 2.使い方

## [プロジェクトを実行するコマンド]
### frontend フォルダに移動
cd frontend
### 開発サーバーを起動
npm run dev

### backend フォルダに移動
cd backend
### サーバーを起動
node server.js



## 3.運用
## (1) [リポジトリの準備（初回のみ）]
   gitHub画面の右上にある「Fork」ボタンを押し、自分のアカウントにリポジトリを複製します。
   自分がフォークしたリポジトリをパソコン（ローカル）にクローンします。
   本家リポジトリ（オリジナル）の更新を追跡できるように、リモート名 `upstream` として登録します。
### 自分のフォークしたリポジトリをクローン（ユーザー名は自分のものに変更）
git clone git@github.com:自分のユーザー名/schedule.git

cd workplace/schedule
### 本家リポジトリを upstream という名前で登録
git remote add upstream git@github.com:ValeriaTang/schedule.git
### 登録されたか確認
git remote -v

## (2)[本家リポジトリの最新状態を取り込む（作業開始前）]
　 作業を始める前に、必ず本家リポジトリ（`upstream`）の最新コードを手元に同期させます。
### 本家の最新情報を取得
git fetch upstream
### 自分の main ブランチに本家の最新状態を強制同期
git checkout main

git reset --hard upstream/main

## (3)[作業用ブランチの作成]
   `main` ブランチで直接作業はせず、必ず機能ごとの新しいブランチを作って切り替えます。
### 新しいブランチを作って切り替え（例: feature/add-calendar）
git checkout -b feature/ブランチ名

## (4)[変更の記録（コミット)]
   コードの追加や修正が終わったら、変更をステージングしてコミットします。
### 変更のあったファイルをステージング（※上層を巻き込まないようフォルダ指定を推奨）
git add workplace/schedule/frontend/

git add workplace/schedule/backend/
### 状態の確認（緑色の文字だけがコミットされます）
git status
### コミットメッセージを書いて記録
git commit -m "feat: ○○機能を追加"

## (5)[自分のフォーク（GitHub）へプッシュ]
   コミットした内容を、自分のGitHub上のフォークリポジトリにアップロードします。
### 作成したブランチを自分のリモート（origin）に送信
git push origin feature/ブランチ名

## (6)[プルリクエスト（Pull Request）の作成]
   自分のGitHubリポジトリ（フォーク側）のページを開きます。
  「Compare & pull request」ボタンが表示されているのでクリックします。
   変更内容のタイトルと説明を書き、本家（`hackathon-SAI/schedule`）の `main` ブランチに向けて「Create pull request」を送信します。

## 更新履歴
* 2026/07/07: [README.md を更新]
