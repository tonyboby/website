
//メッセージ定義
let strMSG = new Object();
//エラーメッセージ
strMSG['EM001'] = "URLが入力されていません。";
strMSG['EM002'] = "エラーが発生しました。内容を確認して、再度実行してください。";
strMSG['EM003'] = "URL以外が入力されています。";
//正常メッセージ
strMSG['IM001'] = "短縮URLを作成しました！コピーして使用してください。";

/**
 * メッセージの呼び出し
 * @param {string} MessageCode メッセージコード
 * @param {string} Param1 パラメータメッセージ1
 * @param {string} Param2 パラメータメッセージ2
 * @param {string} Param3 パラメータメッセージ3
 * @param {string} Param4 パラメータメッセージ4
 */
function getMessage(MessageCode, Param1, Param2, Param3, Param4){
    var strRtn = strMSG[MessageCode];
    if(Param1 != undefined){m = m.replace("$1", Param1);}
    if(Param2 != undefined){m = m.replace("$2", Param2);}
    if(Param3 != undefined){m = m.replace("$3", Param3);}
    if(Param4 != undefined){m = m.replace("$4", Param4);}
    return strRtn;
  }

/**
 * [短縮]ボタン押下処理
 */
$('#btnshorter').click(function(){

    /* **************************************************************
     * ■注意！■　zootie固有のKEYが書かれているので、他で使用しないで下さい！
     *************************************************************** */
    
    /** 
     * FireBaceのアクセスキー 
     * @const {string} アクセスキー 
     */
    const C_Key = 'AIzaSyAEuWCzSayVshaogTPRbUtJGl7jTbEOOYM';
    
    //続けて処理を行うとき、すでに結果が開いているので、いったん閉じる
    $("#result-area").slideUp();

    //入力チェック
    if($('#inputurl').val().trim() == ''){
        //入力されていないときは、URL欄を非表示にし、メッセージを表示
        $('#shortURL').hide();
        $('#ResultMSG').text(getMessage('EM001'));
        $("#result-area").slideDown();
        return;
    }else if($('#inputurl').val().substring(0,4) !== 'http'){
        //URLでない
        $('#shortURL').hide();
        $('#ResultMSG').text(getMessage('EM003'));
        $("#result-area").slideDown();
        return;
    }

    // 多重送信を防ぐため通信完了までボタンをdisableにする
    let objButton = $(this);
    objButton.attr("disabled", true);

    //入力内容からJSONを作成する
    let objSendJSON = {
        longDynamicLink: 'https://manabun.page.link/?link=' + encodeURIComponent($('#inputurl').val()),
        suffix: {
            option: 'SHORT'
        }
    };

    //作成したJSONをPOSTして、結果を取得する
    $.ajax({
        type:"post",                // method = "POST"
        url:"https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=" + C_Key,        // POST送信先のURL
        data:JSON.stringify(objSendJSON),  // JSONデータ本体
        contentType: 'application/json', // リクエストの Content-Type
        dataType: "json",           // レスポンスをJSONとしてパースする
        success: function(json) {   // 200 OK時

            //エラー時に消えている可能性があるので、displayを戻す
            $('#ResultMSG').text(getMessage('IM001'));
            //URL欄を表示
            $('#shortURL').show();

            //jsonから短縮URLを取得
            $('#shortURL').text(json.shortLink);
            
        },
        error: function(ex) {
            // HTTPエラー時
            //レスポンスのボディを取得してJSONにパース
            var json = $.parseJSON(ex.responseText);

            //URL欄を非表示にし、メッセージのみを表示
            $('#shortURL').hide();
            var strAddMSG
            if(!json.error){
                strAddMSG=''
            }else{
                strAddMSG='<br><br>エラーコード：' + json.error.code + '<br>メッセージ：' + json.error.message;
            }
            $('#ResultMSG').text(getMessage('EM002'));
            if(strAddMSG !== ''){
                $('#ResultMSG').append(strAddMSG);
            }
        },
        complete: function() {      
            // 成功・失敗に関わらず通信が終了した際の処理
            //結果の表示
            $("#result-area").slideDown();
            // ボタンを再び enableにする
            objButton.attr("disabled", false);  
        }
    });


});