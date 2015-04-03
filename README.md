# Tiny Piano

enchant.js によるサウンド再生のサンプルです。

## 概要

### マルチタッチ (和音) 対応

スマートフォンの場合、鍵盤の同時押しにより和音を出すことができます。

本来 enchant.js のイベント処理 API はマルチタッチに対応していませんが、イベントを検知した時の座標を手がかりとして擬似的にマルチタッチな UI を実現しました。

稀に指を離してもキーが押されっぱなしになることがあります。その場合はリロードしてください。

### ボリューム調整機能

ディスプレイの下部にあるボリュームつまみを調整することで音量を細かく調整することができます。

## インストール

### ブラウザ版

[http://uhero-kito.github.io/tiny-piano/](http://uhero-kito.github.io/tiny-piano/) にアクセスして、ブラウザ上で直接お使いいただけます。

以下の環境で動作確認済です。

* IE 9 ～ 11
* Google Chrome (最新版)
* Firefox (最新版)
* Opera 12.7, 最新版
* モバイル版 Safari (iOS 8 端末で確認)
* モバイル版 Google Chrome (iOS 8 端末で確認)

### Firefox OS アプリ

Firefox または Firefox OS 端末 ([Fx0](http://au-fx.kddi.com/products/) など) をお使いの場合、
au の [Creator Showcase](http://showcase.kddi.com/csc/) にて

* [Tiny Piano-Creator Showcase](http://showcase.kddi.com/csc/works/view/78)

から直接インストールできます。

### ソースコードから起動する場合

Firefox Developer Edition をお使いの方は、ソースコードからアプリを実行することができます。

1. 以下からソースコード一式をダウンロードします。
	* [Tiny Piano-Creator Showcase](http://showcase.kddi.com/csc/works/view/78) の「DOWNLOAD」ボタン
	* GitHub の Release ページにある [tiny_piano-1.0.1.zip](https://github.com/uhero-kito/tiny-piano/releases/download/v1.0.0/tiny_piano-1.0.1.zip)
2. ダウンロードした ZIP ファイルを適当なフォルダに展開します。
3. Firefox Developer Edition を開き、WebIDE を起動します。
4. 「パッケージ型アプリを開く」を選択し、「2.」で展開したフォルダ名を指定します。

## ライセンス

MIT License で公開しています。詳しくは [LISENCE.txt](https://github.com/uhero-kito/tiny-piano/blob/master/LICENSE.txt) をご覧ください。

## 参考文献

* [enchant.js](http://enchantjs.com/ja/)
* [Photoshopでボリュームコントロール風なツマミを描く | I love Photoshop](http://ilps.ever.jp/photoshop%E3%81%A7%E3%83%9C%E3%83%AA%E3%83%A5%E3%83%BC%E3%83%A0%E3%82%B3%E3%83%B3%E3%83%88%E3%83%AD%E3%83%BC%E3%83%AB%E9%A2%A8%E3%81%AA%E3%83%84%E3%83%9E%E3%83%9F%E3%82%92%E6%8F%8F%E3%81%8F/)