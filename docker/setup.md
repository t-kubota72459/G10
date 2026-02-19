# 生産管理システム実習：Node-RED 環境構築ガイド

本実習では、Docker を使用して全員が同一の Node-RED 環境を構築します。
以下の手順に従って、実習用環境を自分の PC にセットアップしてください。

## 1. 準備：設定ファイルの作成

1. デスクトップやドキュメントなど、任意の場所に作業用フォルダを新規作成してください。
   * フォルダ名例: `fa-jisshu`
2. そのフォルダの中に、`Dockerfile` という名前のファイルを1つ作成します（拡張子はつけません）。
3. テキストエディタ（メモ帳など）で開き、以下の内容をすべてコピー＆ペーストして保存してください。

```dockerfile
FROM nodered/node-red:latest

# 権限エラー回避のため root ユーザーを使用
USER root

# 授業で使うノード（拡張機能）を一括インストール
RUN npm install \
    node-red-dashboard \
    node-red-contrib-modbus \
    node-red-node-sqlite \
    node-red-node-email \
    node-red-contrib-line-notify

# 三菱 PLC 用ノード（拡張機能）をインストール
RUN npm install node-red-contrib-mcprotocol    
```

-----

## 2\. 構築：コマンドの実行

ターミナル（Windows は PowerShell または コマンドプロンプト、Mac は Terminal）を開き、作成したフォルダ（`fa-jisshu`）へ移動してから、以下のコマンドを順に実行します。

### ① イメージの作成（ビルド）

**※最初の1回だけ実行します。**

「設計図（Dockerfile）」から「実習用環境データ」を作成する作業です。

```bash
cd fa-jisshu
docker build -t my-fa-nodered .
```

> **注意:** コマンドの最後にある「 `.` 」（ドット）を忘れずに入力してください。

### ② コンテナの作成と初回起動

**※このコマンドは、実習期間を通じて「最初の1回だけ」実行します。**
（もし環境がおかしくなって、`docker rm` で削除した場合は、もう一度これを実行して作り直します）

```bash
cd fa-jisshu
docker run -u root -d -p 1880:1880 -v ./node-red-data:/data --name fa-system my-fa-nodered
```

-----

### ③ 2回目以降の授業の始め方

**※次回の授業からは、こちらのコマンドを使ってください。**

```bash
cd fa-jisshu
docker start fa-system
```

（これで、前回の続きからそのまま再開できます）

-----

## 3\. 運用：授業の始め方・終わり方

起動後は、以下の手順で操作を行ってください。

| 操作 | 手順 / コマンド |
| :--- | :--- |
| **起動確認** | Webブラウザで [http://localhost:1880](https://www.google.com/search?q=http://localhost:1880) にアクセスする。<br>Node-REDの画面が表示されれば成功です。 |
| **授業終了時** | **`docker stop fa-system`**<br>（コンテナを一時停止します） |
| **授業再開時** | **`docker start fa-system`**<br>（停止していたコンテナを再開します） |
| **最初からやり直す**<br>(設定破損時など) | 1. **`docker rm -f fa-system`** で現在のコンテナを削除<br>2. フォルダ内の `node-red-data` フォルダを削除<br>3. 上記「② コンテナの起動」コマンドを再実行 |

### 補足

  * 実行コマンドに含まれる `-v ./node-red-data:/data` オプションにより、作業フォルダ内に自動的に `node-red-data` というフォルダが作成されます。
  * 皆さんが作成したフローや設定はここに保存されるため、Docker を停止してもデータは消えません。

