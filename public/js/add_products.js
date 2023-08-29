
// const image_input = document.querySelector("#image");


// image_input.addEventListener("change", () => {
    //     const reader = new FileReader();
    //     reader.addEventListener("load", () => {
        //         const uploaded_img = reader.result;
        //         document.querySelector("#new_pr_img").src = uploaded_img;
        //     })
        //     reader.readAsDataURL(this.files[0]);
        // });
        
// display uploaded image
        
$(document).ready(function () {
    const image_display = $("#new_pr_img");

    $("#image").bind("change", function () {
        // alert($(this).val());
        const uploaded_image = this.files[0];

        if(uploaded_image) {
            let reader = new FileReader();
            reader.onload = function (event) {
                // console.log(event.target.result);
                image_display.attr('src', event.target.result);
            }
            reader.readAsDataURL(uploaded_image);
        }

    });
    
    // drag and drop image 
    
    $("#drop-area").on('dragenter', function (e) {
        e.preventDefault();
    });

    $("#drop-area").on('dragover', function (e) {
        e.preventDefault();
    });

    $("#drop-area").on('drop', function (e) {
        e.preventDefault();
        const uploaded_image = e.originalEvent.dataTransfer.files[0];
        // createFormData(image);

        if (uploaded_image) {
            let reader = new FileReader();
            reader.onload = function (event) {
                // console.log(event.target.result);
                image_display.attr('src', event.target.result);
            }
            reader.readAsDataURL(uploaded_image);
        }

    });
});


// const drop_area = document.getElementById("drop-area");
// const input_file = document.getElementById("image");

// drop_area.addEventListener("dragover", function (e) {
//     e.preventDefault();
// })

// drop_area. addEventListener("drop", function (e) {
//     e.preventDefault();
//     input_file.files = e.dataTransfer.files[0];

//     let reader = new FileReader();
//     reader.onload = function (event) {
//         // console.log(event.target.result);
//         image_display.attr('src', event.target.result);
//     }
//     reader.readAsDataURL(uploaded_image);
// })