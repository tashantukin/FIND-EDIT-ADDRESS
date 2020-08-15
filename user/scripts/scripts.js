(function () {
  /* globals $ */
  var scriptSrc = document.currentScript.src;
  var pathname = (
    window.location.pathname + window.location.search
  ).toLowerCase();
  var re = /([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})/i;
  var packageId = re.exec(scriptSrc.toLowerCase())[1];
  var packagePath = scriptSrc.replace("/scripts/scripts.js", "").trim();
  var customFieldPrefix = packageId.replace(/-/g, "");
  const HOST = window.location.host;
  var hostname = window.location.hostname;
  var urls = window.location.href.toLowerCase();
  var userId = $("#userGuid").val();
  function waitForElement(elementPath, callBack) {
    window.setTimeout(function () {
      if ($(elementPath).length) {
        callBack(elementPath, $(elementPath));
      } else {
        waitForElement(elementPath, callBack);
      }
    }, 500);
  }

  function getMarketplaceCustomFields(callback) {
    var apiUrl = "/api/v2/marketplaces";
    $.ajax({
      url: apiUrl,
      method: "GET",
      contentType: "application/json",
      success: function (result) {
        if (result) {
          callback(result.CustomFields);
        }
      },
    });
  }

  function getAddresses(callback) {
    var apiUrl = packagePath + "/get_addresses.php";
    var data = { userId: userId };
    $.ajax({
      url: apiUrl,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(data),
      success: function (response) {
        console.log(JSON.stringify(response));
        custom = $.parseJSON(response);
        console.log($.parseJSON(response));
        if (custom) {
          callback(custom.result.Records);
        }
      },
    });
  }

  function appendEmail() {
    getAddresses(function (result) {
      $.each(result, function (index, addr) {
        var addId = addr.ID;
        var email =
          addr.SpecialInstructions != null ? addr.SpecialInstructions : " ";

        addressIdList.push(addId);
        emailList.push(email);
      });
      addressIdList.reverse();
      emailList.reverse();

      $(".saved-address .address-box:not(.hasemail)").each(function (i) {
        var first_line = $(this)
          .find(".description")
          .contents()
          .filter(function () {
            return !!$.trim(this.innerHTML || this.data);
          })
          .first();
        first_line.after("<br>" + emailList[i]);
        $(this).addClass("hasemail");
      });
    });
  }

  function edit_address(ele) {
    var that = jQuery(ele);
    var attributeVal = [];
    var target = that.parents(".address-box");
    var brExp = /<br\s*\/?>/i;
    target.find(".description").each(function (item, i) {
      attributeVal.push(i.outerHTML);
    });
    var notArray = target.find(".description").outerHTML;
    console.log(attributeVal[0].split(brExp));
    var editedInfo = attributeVal[0].split(brExp);
    console.log(editedInfo);

    var savedName = editedInfo[0]
      .trim()
      .replace('<div class="description">', "")
      .trim()
      .split(" ");
    var selectedCountry = editedInfo[2].trim();
    console.log(savedName);

    bootbox.confirm("Edit address?", function (result) {
      if (result) {
        $("#first-name").val(savedName[0].trim());
        $("#last-name").val(savedName[1].trim());
        $("#contact-email").val();
        $("#myaddress").val(editedInfo[1].trim());
        $("#country").val(editedInfo[3].trim());
        $("#state").val(editedInfo[3].trim());
        $("#city").val(editedInfo[4].trim());
        $("#postal-code").val(editedInfo[5].trim().replace("</div>", ""));

        target.addClass("edit").show();
        target.parents("body").find("#add-new-delivery-ads").show();
        target.parents("body").find("#add-new-ads").hide();
        target.parents("body").find(".saved-address").hide();
        console.log(
          target.parents("body").find("#add-new-delivery-ads").length
        );
        target
          .parents("body")
          .find("#add-new-delivery-ads")
          .find("input[name=ads-first-name]")
          .val(savedName[0].trim());
        target
          .parents("body")
          .find("#add-new-delivery-ads")
          .find("input[name=ads-last-name]")
          .val(savedName[1].trim());
        target
          .parents("body")
          .find("#add-new-delivery-ads")
          .find("input[name=address]")
          .val(editedInfo[1].trim());
        target
          .parents("body")
          .find("#add-new-delivery-ads")
          .find("select[name=country] option")
          .removeAttr("selected");
        target
          .parents("body")
          .find("#add-new-delivery-ads")
          .find("select[name=country] option:contains(" + selectedCountry + ")")
          .attr("selected", "selected");
        target
          .parents("body")
          .find("#add-new-delivery-ads")
          .find("input[name=state]")
          .val(editedInfo[3].trim());
        target
          .parents("body")
          .find("#add-new-delivery-ads")
          .find("input[name=city]")
          .val(editedInfo[4].trim());
        target
          .parents("body")
          .find("#add-new-delivery-ads")
          .find("input[name=postalcode]")
          .val(editedInfo[5].trim().replace("</div>", ""));
        //target.parents('body').find('#address-form').find(".my-btn.btn-black").val("SAVE");
        target
          .parents("body")
          .find("#add-new-delivery-ads")
          .find(".chk-add-btn")
          .attr("onclick", "save_edit_address(this);");
        target
          .parents("body")
          .find("#add-new-delivery-ads")
          .find(".chk-cancel-btn")
          .attr("onclick", "cancel_edit_address(this);");
        //target.parents('body').find('#address-form').find(".my-btn.btn-black").after('<input onclick="cancel_edit_address(this);" type="button" class="my-btn cancel-edit" value="CANCEL">')
      }
    });
  }

  $(document).ready(function () {
    if (
      pathname.indexOf("user/order/deliverydetail") > -1 ||
      pathname.indexOf("user/marketplace/user-settings") > -1
    ) {
      console.log("here");
      waitForElement(".address-box .action", function () {
        console.log("0000");
        let editicon = "<a id ='edit'><i class='icon icon-edit'></i></a>";
        const imgLink =
          "http://" +
          hostname +
          "/user/plugins/" +
          packageId +
          "/images/edit_btn.svg";
        $(".address-inner")
          .find(".address-box")
          .each(function () {
            console.log("cave man!");
            $(".address-box .action").append(editicon);
            $(".icon-edit").css("background-image", imgLink);
          });
      });

      $("body").on("click", "#edit", function () {
        edit_address($(this));
      });
    }
  });
})();
