
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
    let image;

    $("#image").bind("change", function () {
        // alert($(this).val());
        const uploaded_image = this.files[0];
        image = uploaded_image;
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
        const drop_uploaded_image = e.originalEvent.dataTransfer.files[0];
        image = drop_uploaded_image;
        console.log(drop_uploaded_image);
        const uploaded_image = drop_uploaded_image;
        // createFormData(image);

        if (uploaded_image) {
            let reader = new FileReader();
            reader.onload = function (event) {
                image_display.attr('src', event.target.result);
                
            }
            reader.readAsDataURL(uploaded_image);
        }

    });

    // upload img append img

    $('#form-prod').on('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission
        
        // get form data
        let categories = [];
        $('[name="categories"]').each(function () {
            if($(this).is(':checked')) {
                categories.push($(this).val());
            }
            console.log($(this).is(':checked'));
        });
        const product_name = $('form [name="product_name"]');
        const price = $('form [name="price"]');
        const stock = $('form [name="stock"]');

        console.log("cats ", categories);
        console.log("catstype", typeof(categories))
        // append image

        // console.log(file_img);
        // const fileInput = $('#image')[0]; // Get the file input element
        const formData = new FormData(); // Create a FormData object

        // Append the file to the FormData object
        // console.log(f)
        formData.append('image', image);

        formData.append('product_name', product_name.val());
        formData.append('price', price.val());
        formData.append('stock', stock.val());
        formData.append('categories', categories);
        // console.log(formData);

        $.ajax({
            url: '/marketplace/cart_shopping/update_quantity', // Update this with your server route
            method: 'POST',
            data: { action: $(this).val(), product_id: $(this).attr('id') },
            success: function (response) {
                // Update the page content (e.g., outputContainer) with the new value
                // $('#subtotal_cash').text('' + response.updatedValue + ' Bs');
                if (response.reloadPage) {
                    location.reload();
                }
            },
            error: function (error) {
                console.error('Error updating value:', error);
            }
        });

        $.ajax({
            url: $(this).attr('action'),
            method: $(this).attr('method'),
            data: formData,
            processData: false, // Important! Prevent jQuery from processing the data
            contentType: false, // Important! Set content type to false
            enctype: 'multipart/form-data',
            success: function (response, status) {
                console.log('File uploaded successfully');
                console.log(response);
                location.reload();
                // window.location.replace(response.redirect);
            },
            // error: function (error) {
            //     console.error('Error uploading file');
            //     console.error(error);
            // }
        });
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