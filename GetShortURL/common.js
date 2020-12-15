/** 
 * 共通ライブラリ
 * @fileoverview 共通で使用できる処理を定義する
 *     JQueryを読み込んでいることが前提。
 *     コメントを多数記載しているため、minifyして配置する
 */

"use strict";   //厳格モード

/**
* URLパラメータを取得し、連想配列で返す。
* @returns {Array} URLパラメータの連想配列
* @description 連想配列で返ってきた物は、次のようにして返す
* @example 
*     let strparams = GetQueryString();
*     console.log(strparams['date']);
*/
function GetQueryString() {
    if (1 < document.location.search.length) {
        // 最初の1文字 (?記号) を除いた文字列を取得する
        let query = document.location.search.substring(1);

        // クエリの区切り記号 (&) で文字列を配列に分割する
        let strParameters = query.split('&');

        let result = new Object();
        strParameters.forEach(strParam => {
            // パラメータ名とパラメータ値に分割する
            let element = strParam.split('=');

            let paramName = decodeURIComponent(element[0]);
            let paramValue = decodeURIComponent(element[1]);

            // パラメータ名をキーとして連想配列に追加する
            result[paramName] = decodeURIComponent(paramValue);
            
        });
        return result;
    }
    return null;
}


//#region 文字列操作 ==========================================================================================================
/**
 * 引数に指定された文字列が日付型かチェックする
 * @param {String} strDateTime 
 * @returns {Boolean} true:日付型 false:日付以外
 */
function isDateTime(strDateTime){
    let blnRtn
    try{
        blnRtn = strDateTime.match(/^[0-9]{4}\/[0-9]{2}\/[0-9]{2} ([01]?[0-9]|2[0-3]):([0-5][0-9])$/) !== null;
    }
    catch(ex){
        blnRtn = false;
    }
    return blnRtn
}



/**
 * 日付型を指定したフォーマットの文字列に変換する
 * @param {Date} datTergetdate 文字列に変換するDate
 * @param {String} strFormat フォーマット文字列
 * @returns {String} 変換後の文字列
 * @description 使用出来るフォーマットは以下の通り
 *    yyyy,y,MM,M,dd,d,WW,HH,H,mm,m,SS,S,AP
 *    APは、AM・PM
 */
function DateToString(datTergetdate, strFormat) {
    let weekday = ["日", "月", "火", "水", "木", "金", "土"];
    //フォーマットが指定されていないときは、規定のフォーマットとする
    if (!strFormat) {
        strFormat = 'yyyy/MM/dd HH:mm:SS'
    }
    let year = datTergetdate.getFullYear();
    let month = (datTergetdate.getMonth() + 1);
    let day = datTergetdate.getDate();
    let weekday = weekday[datTergetdate.getDay()];
    let hours = datTergetdate.getHours();
    let minutes = datTergetdate.getMinutes();
    let secounds = datTergetdate.getSeconds();

    /* 12時間表示が必要なときは、引数に blnIs12hours を追加する
    let ampm = hours < 12 ? 'AM' : 'PM';
    if (is12hours) {
        hours = hours % 12;
        hours = (hours != 0) ? hours : 12; // 0時は12時と表示する
    }
    */

    //フォーマットに指定されている文字の置換を行うための配列を定義
    let replaceStrArray =
        {
            'yyyy': year,
            'y': year,
            'MM': ('0' + (month)).slice(-2),
            'M': month,
            'dd': ('0' + (day)).slice(-2),
            'dd': day,
            'WW': weekday,
            'HH': ('0' + hours).slice(-2),
            'H': hours,
            'mm': ('0' + minutes).slice(-2),
            'm': minutes,
            'SS': ('0' + secounds).slice(-2),
            's': secounds,
            //'AP': ampm,
        };

    let replaceStr = '(' + Object.keys(replaceStrArray).join('|') + ')';
    let regex = new RegExp(replaceStr, 'g');
    
    //置換文字の配列を使った一括置換を行う
    ret = strFormat.replace(regex, function (str) {
        return replaceStrArray[str];
    });

    //戻り値セット
    return ret;
}


/**
 * 文字列AとBの間の文字列を取得する。
 * 文字列AとBの文言は含まれない。
 * @param {String} strTerget ベース文字列
 * @param {String} strBefor 切り取り開始文字列
 * @param {String} strAffter 切り取り終了文字列
 * @returns {String} 切り取った文字列
 * @description 
 *    元文字列から、開始文字列・終了文字列を検索して、
 *    間の文字列を取得する
 */
function CutoutString(strTerget, strBefor, strAffter){
    let strRtn = strTerget;
    //開始文字列から最後まで取得
    if (typeof strBefor !== "undefined" &&  strRtn.indexOf(strBefor, 0)>= 0) {
        strRtn = strRtn.substring(strRtn.indexOf(strBefor, 0) + strBefor.length);
    }
    //先頭から終了文字列まで取得
    if (typeof strAffter !== "undefined" &&  strRtn.indexOf(strAffter, 0)>= 0) {
        strRtn = strRtn.substring(0, strRtn.indexOf(strAffter, 0));
    }
    //切り出した文言を返す
    return strRtn;
}

//#endregion



//#region タイマー ==========================================================================================================
/**
 * 現在が期間内かどうかを判定する
 * @param {String} strStartDate 開始日時の文字列(yyyy/MM/dd HH:mm:SS)
 * @param {String} strEndDate 終了日時の文字列(yyyy/MM/dd HH:mm:SS)
 * @returns {Boolean} true:表示対象期間内、false:期間外
 */
function IsPeriod(strStartDate, strEndDate) {
    let nowDate = new Date();
    if (new Date(strStartDate) <= nowDate && nowDate <= new Date(strEndDate)) {
        //表示対象期間
        return true;
    }
    //期間外
    return false;
}



/**
 * タグにタイマー設定した要素の表示/非表示を行う。
 * @description 
 *    実行する際は $(document).ready で実行する
 *    カスタム属性：data-start-date と、
 *    data-end-date に設定された期間ないのときに、
 *    要素を表示する。
 */
function ViewTimer(){
    //view_timerクラスのタグを取得
    $(".view_timer").each(function(index, target) {
        //タグに設定されている内容から、表示開始日・終了日を取得する
        let strStartDate = $(this).attr("data-start-date");
        let strEndDate = $(this).attr("data-end-date");
        //比較用に現在日時を取得
        let nowDate = new Date();

        //表示開始日 入力チェック
        if(isDateTime(strStartDate) == false){
            //開始日が日付でないときは、現在日時を入れる
            strStartDate = DateToString(nowDate,"yyyy/MM/dd");
        }

        //表示終了日 入力チェック
        if(isDateTime(strEndDate) == false){
            //終了日が日付でないときは、現在日時を入れる
            strEndDate = DateToString(nowDate,"yyyy/MM/dd");
        }

        //表示判定
        if(strStartDate != strEndDate && IsPeriod(strStartDate, strEndDate) == true){
            //期間内なら表示
            $(this).show();
        } else {
            //期間外なら非表示
            $(this).hide();
        }
    });
}
//#endregion



//#region Cookie処理 ==========================================================================================================

/**
 * Cookieの情報を取得する
 * @param {string} strKey 取得するCookieのキー
 */
function CookieGet(strKey){
    let strRtn = '';
    if(document.cookie != ''){
        //Cookieが存在するとき、連想配列としてCookieを取得して取り出す
        let arrCookie = new Array();
        //配列に入れる
        let strCookieList = document.cookie.split('; ');
        //1件ずつ、連想配列にセットする
        strCookieList.forEach(element => {
            let datCookei = element.split('=');
            arrCookie[datCookei[0]] = decodeURIComponent(datCookei[1]);
        });
        strRtn = arrCookie[strKey]
        //連想配列に存在しないキーのときは、空白を返す
        if (typeof strRtn === "undefined") {
            strRtn = '';
        }
    }

    return strRtn
}

/**
 * Cookieに引数で指定された内容を登録する
 * @param {string} strKey キー名
 * @param {string} strValue 値
 * @param {integer} opt_intKeepMinute Cookie保持期間(分)(デフォルト1時間)
 * @description 
 *    opt_intKeepMinuteは省略可能。
 */
function CookieSet(strKey, strValue, opt_intKeepMinute){
    let intSec = 3600 * 24;  //デフォルト1日
    //引数が指定されているときは分を秒に直す
    if(typeof opt_intKeepMinute !== "undefined"){
        intSec = opt_intKeepMinute * 60
    }
    //Cookieにセット
    document.cookie = strKey + '=' + encodeURIComponent(strValue) + '; max-age=' + intSec;
}



/**
 * Cookieの情報を削除する
 * @param {String} strKey 
 */
function CookieDel(strKey){
    //削除するときはマイナス期間を指定する
    CookieSet(strKey, '', -1);
}

//#endregion



/**
 * iframeの縦スクロールバーが出ないように高さを調整する
 * @example 
 *    <iframe class="autoHeight" src="hoge.html"></iframe>
 *    $(window).on("load",function(){ AutoIframeHeight(); });
 * @description
 *    同じドメイン内のiframeにのみ有効。
 *    【使い方】
 *    1.iframeに「autoHeight」クラスを追加
 *    2.$(window).load で本スクリプトを呼び出す。
 *    →「$(document).ready」ではないのは、要素の配置が終わっていても、
 *     iframeの中身を読み込み終わっているわけではないので、
 *     スクリプトの実行されたタイミングによっては
 *     iframeの高さが取れない場合があるため
 *     参照：http://dtp.jdash.info/archives/jQuery_iframe_auto_height_script
 */
function AutoIframeHeight(){
    $('iframe.autoHeight').each(function(){
        //iframeのオブジェクトを取得
        let objDocument = $(this).get(0).contentWindow.document;
        //iframeの高さを取得
        let innerHeight = Math.max(
            objDocument.body.scrollHeight, objDocument.documentElement.scrollHeight,
            objDocument.body.offsetHeight, objDocument.documentElement.offsetHeight,
            objDocument.body.clientHeight, objDocument.documentElement.clientHeight
            );
        //iframe呼び出し元のCSSの高さを変更する
        $(this).removeAttr("height").css('height', innerHeight + 'px');
    });
}







/**
 * JSONP取得
 * @param {String} strURL JSONPのURL
 * @param {String} strCallback JSONのコールバック関数名
 * @param {Function} funcCallBack JSON読み込み成功時に実行する関数名。引数にJSONが指定されていること
 * @param {Boolean} opt_blnUseCache キャッシュの使用有無(デフォルトFalse)
 * @param {Function} opt_funcErrorCallBack JSON読み込み成功時に実行する関数名。引数にえらが指定されていること
 * @description 
 *     引数のURLのJSONPを取得する
 *     本関数がjqueryを使用しているため、先に読み込みを行っておく
 */
function GetJSONP(strURL, strCallback, funcCallBack, opt_blnUseCache, opt_funcErrorCallBack){
    let blnUseCach = false;         //キャッシュをするかどうか
    //オプションのデフォルト値を指定する
    if(typeof opt_blnUseCache !== "undefined"){
        blnUseCach = opt_blnUseCache;
    }
    $.ajax({url: strURL,
        type: 'GET', 
        dataType: 'jsonp',
        jsonpCallback: strCallback,
        cache: blnUseCach,
    })
    .done((json) => {
        //成功時は引数で渡された関数を呼び出す
        funcCallBack(json);
    })
    .fail((error) => {
        //失敗時は
        if(typeof opt_funcErrorCallBack !== "undefined"){
            //オプションが指定されているときは、指定された関数を呼び出す
            opt_funcErrorCallBack(error);
        }else{
            //オプションが指定されていないときはコンソールにログする
            console.log(error.message);
        }
    });
}



/*
あと入れたいもの
lazyload

指定高さでピョコ

*/