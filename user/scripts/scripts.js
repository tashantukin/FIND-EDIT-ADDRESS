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
        console.log(JSON.stringify(response));
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
    var selectedCountry = editedInfo[3].trim();
    console.log(savedName);

    bootbox.confirm("Edit address?", function (result) {
      if (result) {
        $("#first-name").val(savedName[0].trim());
        $("#last-name").val(savedName[1].trim());
        $("#contact-email").val(editedInfo[1].trim());
        $("#myaddress").val(editedInfo[2].trim());
        $("#country").removeAttr("selected");
        $("select[name=country] option:contains(" + selectedCountry + ")").attr(
          "selected",
          "selected"
        );

        $("#state").val(editedInfo[4].trim());
        $("#city").val(editedInfo[5].trim());
        $("#postal-code").val(editedInfo[6].trim().replace("</div>", ""));

        target.addClass("edit").show();
      }
    });
  }
  function save_address(addressId) {}

  $(document).ready(function () {
    if (
      pathname.indexOf("user/order/deliverydetail") > -1 ||
      pathname.indexOf("user/marketplace/user-settings") > -1 ||
      pathname.indexOf("/user/marketplace/seller-settings") > -1
    ) {
      var last_tab = localStorage.getItem("last_tab");
      if (last_tab == "address-tab") {
        console.log("localstorage get");
        $("#profie-tab").removeClass("active");
        waitForElement("#jobtitle", function () {
          if ($("#jobtitle").val()) {
            console.log("switching tabs");
            $("#address-tab").click();
            localStorage.removeItem("last_tab");
          }
        });
      }

      // $(window).unload(function () {
      //   localStorage.removeItem("last_tab");
      // });

      $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        if (
          options.type.toLowerCase() === "post" &&
          options.url.toLowerCase().indexOf("/settings/insertaddress") >= 0
        ) {
          let success = options.success;
          var email = $("#contact-email").val();
          console.log("email in ajax " + email);
          // $.extend(options.data, { 'SpecialInstructions': email });
          options.data += "&" + $.param({ SpecialInstructions: email });
          options.success = function (data, textStatus, jqXHR) {
            console.log("data " + data);
            localStorage.setItem("last_tab", "address-tab");
            location.reload();
            if (typeof success === "function")
              return success(data, textStatus, jqXHR);
          };
        }
      });

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
  });
})();
