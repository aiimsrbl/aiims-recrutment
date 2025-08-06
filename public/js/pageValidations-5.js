$("#pgQualiDetailsCard .row").each(function () {
    let divRow = $(this);
    divRow.find('input').eq(1).on('change', function () {
        if (this.value && this.value.length) {
            divRow.find('input').addClass('required');
        } else {
            divRow.find('input').removeClass('required');
        }
    })
})

$("#beforPgExpDiv .row").each(function () {
    let divRow = $(this);
    divRow.find('input').eq(0).on('change', function () {
        if (this.value && this.value.length) {
            divRow.find('input').addClass('required');
        } else {
            divRow.find('input').removeClass('required');
        }
    })
})

$("#afterPgExpDiv .row").each(function () {
    let divRow = $(this);
    divRow.find('input').eq(0).on('change', function () {
        if (this.value && this.value.length) {
            divRow.find('input').addClass('required');
        } else {
            divRow.find('input').removeClass('required');
        }
    })
})


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
    $('#ageAsOn').html(ageason);
    $('#ageAsOnDiv').show();
}

function changeDomicile(nationality) {
    if (nationality === 'Indian') {
        $('#domicileSelectDiv').show();
        $("#domicileSelect").attr("name", "domicile");
        $('#domicileBox').hide();
        $("#domicileBox").removeAttr("name");
    } else {
        $('#domicileSelectDiv').hide();
        $("#domicileSelect").removeAttr("name");
        $('#domicileBox').show();
        $("#domicileBox").attr("name", "domicile");
    }
}

function copyAddress(val) {
    if ($('#permanentCheckbox').is(':checked')) {
        $("#permanentAddressDiv").hide(); // unchecked
    } else {
        $('#permanentAddressDiv').show();
    }
}

function changeTab(href) {
    $(`#tabs a[href="${href}"]`).tab('show')
}

function showHideRetd(value) {
    if (value == 'Direct') {
        $('#retdYes').attr("disabled", true);
        $('#retdNo').prop('checked', true);
    } else {
        $('#retdYes').removeAttr("disabled");
        $('#retdNo').prop('checked', false);
    }
}

$(document).on("keydown", ":input:not(textarea)", function(event) {
    return event.key != "Enter";
});

function showHideCat(val) {
    if (val == 'OBC') {
        $('#catUR').attr("disabled", true);
        $('#catEWS').attr("disabled", true);
        $('#catST').removeAttr("disabled");
        $('#catSC').removeAttr("disabled");
        $('#catOBC').removeAttr("disabled");

        $('#catUR').prop('checked', false);
        $('#catEWS').prop('checked', false);
        $('#catOBC').prop('checked', false);
        $('#catST').prop('checked', false);
        $('#catSC').prop('checked', false);
    } else if (val == 'SC' || val == 'ST') {
        $('#catUR').attr("disabled", true);
        $('#catEWS').attr("disabled", true);
        $('#catOBC').attr("disabled", true);

        $('#catUR').prop('checked', false);
        $('#catEWS').prop('checked', false);
        $('#catOBC').prop('checked', false);
        $('#catST').prop('checked', false);
        $('#catSC').prop('checked', false);
    } else {
        $('#catUR').removeAttr("disabled");
        $('#catEWS').removeAttr("disabled");
        $('#catOBC').removeAttr("disabled");

        $('#catUR').prop('checked', false);
        $('#catEWS').prop('checked', false);
        $('#catOBC').prop('checked', false);
        $('#catST').prop('checked', false);
        $('#catSC').prop('checked', false);
    }
}


let departVacn = [
    {
        "advID" : "",
        "isActive" : true,
        "departmentID":"",
        "departmentName":"Non Academic",
        "applyFor" : [{ "postName": "Junior Resident", "postId": "", "UR":"19","OBC":"10","SC":"05","ST":"03","EWS":"03","Total":"40"}]
    }
    ];

$("#postSelect").change(function (event) {
    $("#depSelect")
        .find('option')
        .remove()
        .end()
        .append($("<option />")
        .val("")
        .text("Select"));
    let postVal = $("#postSelect").val();
    for(let i = 0; i < departVacn.length; i++){
        let depDeatils = departVacn[i];
        for(let j = 0; j < depDeatils.applyFor.length; j++){
            if(
                depDeatils.applyFor[j].postName == postVal &&
                depDeatils.applyFor[j].Total > 0
            ) {
                $("#depSelect")
                    .append($("<option />")
                    .val(depDeatils.departmentName)
                    .text(depDeatils.departmentName));
            }
        }
    }
});

$("#depSelect").change(function (event) {
    let advRefVal = $('#advRefVal').text().trim();
    let postVal = $("#postSelect").val();
    if (!postVal || postVal == "") {
        alert('First select Apply For Field.')
        $("#depSelect option[value='']").attr("selected", "selected");
    } else {
        let depVal = $("#depSelect").val();
        let vaccInnerHtml = "";

        for(let i = 0; i < departVacn.length; i++){
            let depDeatils = departVacn[i];
            if(depDeatils.departmentName == depVal){
                for(let j = 0; j < depDeatils.applyFor.length; j++){
                    if(
                        depDeatils.applyFor[j].postName == postVal
                    ) {
                        vaccInnerHtml = `Open vacancy for selected post and selected  department: UR: ${depDeatils.applyFor[j].UR}, OBC: ${depDeatils.applyFor[j].OBC}, SC: ${depDeatils.applyFor[j].SC}, ST: ${depDeatils.applyFor[j].ST}, EWS: ${depDeatils.applyFor[j].EWS}, Total: ${depDeatils.applyFor[j].Total}`;
                    }
                }
            }
        }
        $("#vacancyDetails").show();
        $("#vacancyDetails").html(vaccInnerHtml);
        $.ajax({
            type: 'post',
            url: `/check-duplicate-application`,
            data: {
                post: postVal,
                department: depVal,
                advRefNo: advRefVal
            }
        })
        .done(function (response) {
            console.log(response);
            if (response.success) {
                return true;
            } else {
                alert(`Error! ${response.err}`)
            }
        })
    }
});