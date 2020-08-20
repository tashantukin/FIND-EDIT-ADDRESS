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
  var addressIdList = [];
  function waitForElement(elementPath, callBack) {
    window.setTimeout(function () {
      if ($(elementPath).length) {
        callBack(elementPath, $(elementPath));
      } else {
        waitForElement(elementPath, callBack);
      }
    }, 500);
  }

  function scroll_to(div) {
    $("html, body").animate(
      {
        scrollTop: div.offset().top,
      },
      1000
    );
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
    var apiUrl = packagePath + "/get_address.php";
    var data = { userId: userId };
    $.ajax({
      url: apiUrl,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(data),
      success: function (response) {
        console.log(JSON.stringify(response));
        custom = $.parseJSON(response);
        // console.log($.parseJSON(response));
        if (custom) {
          callback(custom.result.Records);
        }
      },
    });
  }

  function deleteAddress(addressId) {
    var apiUrl = packagePath + "/delete_address.php";
    var data = { userId: userId, address_id: addressId };
    $.ajax({
      url: apiUrl,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(data),
      success: function (response) {
        $(".address-inner").find(".toEdit").parent("div").remove();
        $(".saved-address").find(".toEdit").remove();
      },
    });
  }

  function loadId() {
    getAddresses(function (result) {
      $.each(result, function (index, addr) {
        var addId = addr.ID;
        addressIdList.push(addId);
      });
      addressIdList.reverse();

      $(".address-inner .address-box:not(.hasid)").each(function (i) {
        $(this).attr("address-id", addressIdList[i]);
        $(this).addClass("hasid");
      });
    });
  }

  function loadIdDelivery() {
    getAddresses(function (result) {
      $.each(result, function (index, addr) {
        var addId = addr.ID;
        addressIdList.push(addId);
      });
      addressIdList.reverse();

      $(".saved-address .address-box:not(.hasid)").each(function (i) {
        $(this).attr("address-id", addressIdList[i]);
        $(this).addClass("hasid");
      });
    });
  }
  function addButton() {
    let editicon = "<a id ='edit'><i class='icon icon-edit'></i></a>";
    const imgLink =
      "http://" +
      hostname +
      "/user/plugins/" +
      packageId +
      "/images/edit_btn.svg";
    $(".address-inner")
      .find(".address-box .action:not(.hasEdit)")
      .each(function () {
        console.log("cave man!");
        $(this).append(editicon);
        $(".icon-edit").css("background-image", imgLink);
        $(this).addClass("hasEdit");
      });
    // });
  }

  function addButtonDelivery() {
    let editicon =
      "<span class='edit-address'><a id ='edit'><i class='icon icon-edit'></i></a></span>";
    const imgLink =
      "http://" +
      hostname +
      "/user/plugins/" +
      packageId +
      "/images/edit_btn.svg";
    $(".svd-adrsbox-inner")
      .find(".action:not(.hasEdit)")
      .each(function () {
        console.log("cave man!");
        $(this).append(editicon);
        $(".icon-edit").css("background-image", imgLink);
        $(this).addClass("hasEdit");
      });
    // });
  }

  function edit_address(ele) {
    //for delivery settings page

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
    var selectedCountry = editedInfo[3].trim();
    console.log(savedName);

    bootbox.confirm("Edit address?", function (result) {
      if (result) {
        //if delivery page
        if ($("#add-new-ads").length) {
          $("#add-new-ads").hide();
          $("#add-new-delivery-ads").show();

          var editDiv = $("#add-new-delivery-ads");
          scroll_to(editDiv);
        }
        //if settings page
        if ($("#first-name").length) {
          $(window).scrollTop(0);
        }

        $("#ads-first-name").val(savedName[0].trim());
        $("#first-name").val(savedName[0].trim());
        $("#last-name").val(savedName[1].trim());
        $("#ads-last-name").val(savedName[1].trim());
        $("#contact-email").val(editedInfo[1].trim());
        $("#delEmail").val(editedInfo[1].trim());
        $("#address").val(editedInfo[2].trim());
        $("#myaddress").val(editedInfo[2].trim());
        $("#country").removeAttr("selected");
        $("select[name=country] option:contains(" + selectedCountry + ")").attr(
          "selected",
          "selected"
        );

        $("#state").val(editedInfo[4].trim());
        $("#city").val(editedInfo[5].trim());
        $("#postal-code").val(editedInfo[6].trim().replace("</div>", ""));
        $("#postalcode").val(editedInfo[6].trim().replace("</div>", ""));

        target.addClass("edit").show();
      }
    });
  }
  function save_address(addressId) {}

  $(document).ready(function () {
    if (
      pathname.indexOf("user/marketplace/user-settings") > -1 ||
      pathname.indexOf("/user/marketplace/seller-settings") > -1
    ) {
      loadId();
      addButton();

      $(".address-inner .address-box")
        .find("#edit")
        .on("click", function () {
          $(this).parents(".address-inner .address-box").addClass("toEdit");
          $("#address-form .btn-area .my-btn").addClass("forEdit");

          edit_address($(this));
        });

      //save button
      $("body").on("click", "#address-form .btn-area .forEdit", function () {
        console.log("button clicked!");
        var address_id = $(".address-inner").find(".toEdit").attr("address-id");
        console.log(address_id);
        deleteAddress(address_id);
      });

      $("body").on("click", "#address-tab", function () {
        loadId();
        addButton();
      });
    }

    if (pathname.indexOf("user/order/deliverydetail") > -1) {
      addButtonDelivery();
      loadIdDelivery();

      $(".address-box .svd-adrsbox-inner")
        .find("#edit")
        .on("click", function () {
          $(this).parents(".address-box").addClass("toEdit");
          $("#add-new-delivery-ads .chk-add-btn").addClass("forEdit");

          edit_address($(this));
        });

      //save button
      $("body").on("click", "#add-new-delivery-ads .forEdit", function () {
        console.log("button clicked!");
        var address_id = $(".saved-address").find(".toEdit").attr("address-id");
        console.log(address_id);
        deleteAddress(address_id);
      });
    }
  });
})();
