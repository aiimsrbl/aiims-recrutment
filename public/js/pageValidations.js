$("#pgQualiDetailsCard .row").each(function () {
  let divRow = $(this);
  divRow
    .find("input")
    .eq(1)
    .on("change", function () {
      if (this.value && this.value.length) {
        divRow.find("input").addClass("required");
      } else {
        divRow.find("input").removeClass("required");
      }
    });
});

$("#beforPgExpDiv .row").each(function () {
  let divRow = $(this);
  divRow
    .find("input")
    .eq(0)
    .on("change", function () {
      if (this.value && this.value.length) {
        divRow.find("input").addClass("required");
      } else {
        divRow.find("input").removeClass("required");
      }
    });
});

$("#afterPgExpDiv .row").each(function () {
  let divRow = $(this);
  divRow
    .find("input")
    .eq(0)
    .on("change", function () {
      if (this.value && this.value.length) {
        divRow.find("input").addClass("required");
      } else {
        divRow.find("input").removeClass("required");
      }
    });
});

function enablePerBox() {
  $("#pwbdPercentage").show();
  $("#disabilityCert").addClass("required");
}

function disablePerBox() {
  $("#pwbdPercentage").hide();
  $("#disabilityCert").removeClass("required");
}

function enableRetdBox() {
  $("#retdDateBox").show();
}

function disableRetdBox() {
  $("#retdDateBox").hide();
}

function calcAge(date) {
  let ageason = moment(date).fromNow(true);
  $("#ageAsOn").html(ageason);
  $("#ageAsOnDiv").show();
}

function changeDomicile(nationality) {
  if (nationality === "Indian") {
    $("#domicileSelectDiv").show();
    $("#domicileSelect").attr("name", "domicile");
    $("#domicileBox").hide();
    $("#domicileBox").removeAttr("name");
  } else {
    $("#domicileSelectDiv").hide();
    $("#domicileSelect").removeAttr("name");
    $("#domicileBox").show();
    $("#domicileBox").attr("name", "domicile");
  }
}

function copyAddress(val) {
  if ($("#permanentCheckbox").is(":checked")) {
    $("#permanentAddressDiv").hide(); // unchecked
  } else {
    $("#permanentAddressDiv").show();
  }
}

function changeTab(href) {
  $(`#tabs a[href="${href}"]`).tab("show");
}

function showHideRetd(value) {
  if (value == "Direct") {
    $("#retdYes").attr("disabled", true);
    $("#retdNo").prop("checked", true);
  } else {
    $("#retdYes").removeAttr("disabled");
    $("#retdNo").prop("checked", false);
  }
}

$(document).on("keydown", ":input:not(textarea)", function (event) {
  return event.key != "Enter";
});

function showHideCat(val) {
  if (val == "OBC") {
    $("#catUR").attr("disabled", true);
    $("#catEWS").attr("disabled", true);
    $("#catST").removeAttr("disabled");
    $("#catSC").removeAttr("disabled");
    $("#catOBC").removeAttr("disabled");

    $("#catUR").prop("checked", false);
    $("#catEWS").prop("checked", false);
    $("#catOBC").prop("checked", false);
    $("#catST").prop("checked", false);
    $("#catSC").prop("checked", false);
  } else if (val == "SC" || val == "ST") {
    $("#catUR").attr("disabled", true);
    $("#catEWS").attr("disabled", true);
    $("#catOBC").attr("disabled", true);

    $("#catUR").prop("checked", false);
    $("#catEWS").prop("checked", false);
    $("#catOBC").prop("checked", false);
    $("#catST").prop("checked", false);
    $("#catSC").prop("checked", false);
  } else {
    $("#catUR").removeAttr("disabled");
    $("#catEWS").removeAttr("disabled");
    $("#catOBC").removeAttr("disabled");

    $("#catUR").prop("checked", false);
    $("#catEWS").prop("checked", false);
    $("#catOBC").prop("checked", false);
    $("#catST").prop("checked", false);
    $("#catSC").prop("checked", false);
  }
}

let departVacn = [
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Anatomy",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "2",
        OBC: "1",
        SC: "0",
        ST: "0",
        EWS: "0",
        Total: "3",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Anaesthesia",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "0",
        OBC: "1",
        SC: "0",
        ST: "1",
        EWS: "0",
        Total: "2",
      },
    ],
  },

  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Biochemistry",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "1",
        OBC: "2",
        SC: "2",
        ST: "0",
        EWS: "0",
        Total: "5",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Cardiology",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "3",
        OBC: "3",
        SC: "1",
        ST: "0",
        EWS: "0",
        Total: "7",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Community Medicine",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "1",
        OBC: "0",
        SC: "0",
        ST: "0",
        EWS: "1",
        Total: "2",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "CTVS",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "3",
        OBC: "0",
        SC: "2",
        ST: "0",
        EWS: "0",
        Total: "5",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Dentistry-General",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "0",
        OBC: "1",
        SC: "0",
        ST: "0",
        EWS: "0",
        Total: "1",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Dermatology",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "0",
        OBC: "1",
        SC: "1",
        ST: "0",
        EWS: "0",
        Total: "2",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Endocrinology",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "1",
        OBC: "1",
        SC: "1",
        ST: "1",
        EWS: "0",
        Total: "4",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "ENT",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "0",
        OBC: "0",
        SC: "0",
        ST: "0",
        EWS: "1",
        Total: "1",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Forensic Medicine",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "2",
        OBC: "1",
        SC: "1",
        ST: "0",
        EWS: "0",
        Total: "4",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Gastroenterology",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "1",
        OBC: "2",
        SC: "1",
        ST: "0",
        EWS: "1",
        Total: "5",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "General Medicine",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "3",
        OBC: "2",
        SC: "1",
        ST: "1",
        EWS: "0",
        Total: "7",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "General Surgery",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "3",
        OBC: "3",
        SC: "0",
        ST: "1",
        EWS: "1",
        Total: "8",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Hospital Administration",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "1",
        OBC: "1",
        SC: "1",
        ST: "0",
        EWS: "0",
        Total: "3",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Medical Oncology",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "2",
        OBC: "1",
        SC: "1",
        ST: "0",
        EWS: "0",
        Total: "4",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Microbiology",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "2",
        OBC: "2",
        SC: "0",
        ST: "1",
        EWS: "0",
        Total: "5",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Nephrology",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "2",
        OBC: "2",
        SC: "2",
        ST: "1",
        EWS: "0",
        Total: "7",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Neurology",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "2",
        OBC: "2",
        SC: "3",
        ST: "1",
        EWS: "0",
        Total: "8",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Neurosurgery",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "3",
        OBC: "1",
        SC: "1",
        ST: "1",
        EWS: "1",
        Total: "7",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Nuclear Medicine",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "1",
        OBC: "0",
        SC: "0",
        ST: "0",
        EWS: "1",
        Total: "2",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Obstetrics and Gynaecology",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "0",
        OBC: "3",
        SC: "1",
        ST: "0",
        EWS: "2",
        Total: "6",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Ophthalmology",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "0",
        OBC: "2",
        SC: "1",
        ST: "0",
        EWS: "0",
        Total: "3",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Orthopaedics",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "1",
        OBC: "0",
        SC: "0",
        ST: "0",
        EWS: "3",
        Total: "4",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Paediatrics",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "1",
        OBC: "0",
        SC: "0",
        ST: "0",
        EWS: "3",
        Total: "4",
      },
    ],
  },

  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Paediatric Surgery",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "2",
        OBC: "2",
        SC: "1",
        ST: "0",
        EWS: "0",
        Total: "5",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Pathology",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "2",
        OBC: "3",
        SC: "0",
        ST: "0",
        EWS: "0",
        Total: "5",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Pharmacology",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "1",
        OBC: "1",
        SC: "0",
        ST: "1",
        EWS: "0",
        Total: "3",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Physical Medicine and Rehabilitation",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "1",
        OBC: "1",
        SC: "0",
        ST: "1",
        EWS: "0",
        Total: "3",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Physiology",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "0",
        OBC: "2",
        SC: "1",
        ST: "0",
        EWS: "0",
        Total: "3",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Psychiatry",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "0",
        OBC: "0",
        SC: "0",
        ST: "1",
        EWS: "1",
        Total: "2",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Pulmonary Medicine",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "2",
        OBC: "2",
        SC: "2",
        ST: "0",
        EWS: "1",
        Total: "7",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Radiology",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "2",
        OBC: "1",
        SC: "1",
        ST: "1",
        EWS: "0",
        Total: "5",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Radiotherapy",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "1",
        OBC: "2",
        SC: "0",
        ST: "0",
        EWS: "0",
        Total: "3",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Transfusion Medicine",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "1",
        OBC: "1",
        SC: "1",
        ST: "0",
        EWS: "1",
        Total: "4",
      },
    ],
  },
  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Trauma and Emergency",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "2",
        OBC: "2",
        SC: "0",
        ST: "0",
        EWS: "0",
        Total: "4",
      },
    ],
  },

  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Surgical Oncology",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "1",
        OBC: "0",
        SC: "1",
        ST: "2",
        EWS: "0",
        Total: "4",
      },
    ],
  },

  {
    advID: "",
    isActive: true,
    departmentID: "",
    departmentName: "Urology",
    applyFor: [
      {
        postName: "Senior Resident",
        postId: "",
        UR: "1",
        OBC: "2",
        SC: "0",
        ST: "1",
        EWS: "1",
        Total: "5",
      },
    ],
  },
];

$("#postSelect").change(function (event) {
  $("#depSelect")
    .find("option")
    .remove()
    .end()
    .append($("<option />").val("").text("Select"));
  let postVal = $("#postSelect").val();
  for (let i = 0; i < departVacn.length; i++) {
    let depDeatils = departVacn[i];
    for (let j = 0; j < depDeatils.applyFor.length; j++) {
      if (
        depDeatils.applyFor[j].postName == postVal &&
        depDeatils.applyFor[j].Total > 0
      ) {
        $("#depSelect").append(
          $("<option />")
            .val(depDeatils.departmentName)
            .text(depDeatils.departmentName)
        );
      }
    }
  }
});

$("#depSelect").change(function (event) {
  let advRefVal = $("#advRefVal").text().trim();
  let postVal = $("#postSelect").val();
  if (!postVal || postVal == "") {
    alert("First select Apply For Field.");
    $("#depSelect option[value='']").attr("selected", "selected");
  } else {
    let depVal = $("#depSelect").val();
    let vaccInnerHtml = "";

    for (let i = 0; i < departVacn.length; i++) {
      let depDeatils = departVacn[i];
      if (depDeatils.departmentName == depVal) {
        for (let j = 0; j < depDeatils.applyFor.length; j++) {
          if (depDeatils.applyFor[j].postName == postVal) {
            vaccInnerHtml = `Open vacancy for selected post and selected  department: UR: ${depDeatils.applyFor[j].UR}, OBC: ${depDeatils.applyFor[j].OBC}, SC: ${depDeatils.applyFor[j].SC}, ST: ${depDeatils.applyFor[j].ST}, EWS: ${depDeatils.applyFor[j].EWS}, Total: ${depDeatils.applyFor[j].Total}`;
          }
        }
      }
    }
    $("#vacancyDetails").show();
    $("#vacancyDetails").html(vaccInnerHtml);
    $.ajax({
      type: "post",
      url: `/check-duplicate-application`,
      data: {
        post: postVal,
        department: depVal,
        advRefNo: advRefVal,
      },
    }).done(function (response) {
      console.log(response);
      if (response.success) {
        return true;
      } else {
        alert(`Error! ${response.err}`);
      }
    });
  }
});
