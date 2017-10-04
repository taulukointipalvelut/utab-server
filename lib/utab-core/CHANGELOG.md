## Comments

If you need some futures in the next api version, open an issue in this repository.

整数でメジャーなバージョンアップを表す.

そのバージョンで取り入れる予定の機能を実装し終わって以降, 本体に実装上の変更が生じた場合にはマイナーバージョンを表すために0.1ずつ追加していく.

バージョンの数字が変わるときにはかならず変更内容をCHANGELOG.mdに記載する.

## UTab core js * Version 1.0 *

This version is designed for providing minimum but necessary interfaces.

The following list is newly added for version 1.0

1. 基本的なmethodを準備.
1. 複数トーナメントに対応.
1. コードとインターフェースのシンプル化.
1. ドキュメント整備.
1. 内部で名前ではなくidを使用. 複雑なチーム名, 重複したディベーター名などが使用可能に.
1. データベース操作とマッチアップ作成/結果まとめの分離
1. マッチングのアルゴリズムを変更
1. トーナメント関係の情報以外は副作用なし
