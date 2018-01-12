/** @const {string} */
var JQUERY_URL = 'php/functions.php';

var MIN_NAME_LENGTH = 3;
var MAX_NAME_LENGTH = 32;
var NAME_PATTERN = /[a-zA-Z0-9]{1,64}$/;

var MIN_PSWD_LENGTH = 6;
var MAX_PSWD_LENGTH = 32;

/** @type {string} */
var ERROR_LOCAL_STORAGE = 'You browser does not support HTML5 Local Storage, '
    + 'but cookies version is not implemented yet. Please, open page in '
    + 'another browser';

/** @type {number} */
var current_time = 0;
var kaqueues = [];
var user = {'id': '',
            'arris_id': '',
            'name': '',
            'surname': '',
            'email': '',
            'title': '',
            'department': '',
            'type': '',
            'page': 'login', // possible values: login, kaqueue, deliverylist, svncommits, userinfo
            'queue': 'KA_trunk', // possible values: KA_trunk, KA_Ftr3.0_maint, KA_Alder4.0_maint etc.
            'dls_archi': 'no',
            'dls_age': 'year',
            'dls_queue': 'All',
            'target_id': '0',
            'target_name': 'none',
            'queue_status': 'ACTIVE'}; // ACTIVE shows only currently active queues, DISABLED shows all queues

function refresh_data() {
    var curr_url = window.location.href;
    if (curr_url.indexOf('#close_window') !== -1) {
        // remove #close_window tag from url
        curr_url = curr_url.substring(0, curr_url.indexOf('#close_window'));
        window.location.href = curr_url;
    }

    if (get_local_user_info()) {
        // set user name and surname
        var login_page = document.getElementsByClassName('login');
        login_page[0].style.display = 'none';
        var user_info_id = document.getElementById('page_selector_user_info_id');
        user_info_id.innerHTML = user.name + ' ' + user.surname;
        document.getElementById('page_selector_queue_link_id').innerHTML = 'KA Queues';
        document.getElementById('page_selector_list_link_id').innerHTML = 'Delivery List';
        document.getElementById('page_selector_svn_link_id').innerHTML = 'SVN Commits';

        if (user.type !== 'USER') {
            document.getElementById('page_selector_admin_link_id').innerHTML = 'Admin';
        }

        change_page_elements_visibility();

        // HTML5 Server-Sent Events
        /*var newsmaker = document.getElementById("newsmaker");
        newsmaker.style.display = '';
        if (typeof(EventSource) !== "undefined") {
            var source = new EventSource("php/events.php");
            newsmaker.style.display = '';
            source.onmessage = function(event) {
                // alert(JSON.stringify(event.data));
                newsmaker.innerHTML = '';
                if (event.data.length > 1) {
                    for (var i = 0; i < event.data.length; i++) {
                        newsmaker.innerHTML += event.data[i]['QUEUE'] + ' ' + event.data[i]['EMAIL'] + '<br>';
                    }
                }
            };
            // to cancel a stream from the client
            // source.close();
        } else {
            newsmaker.innerHTML = "Sorry, your browser does not support server-sent events...";
        }*/

    } else {
        var page = document.getElementsByClassName('login');
        page[0].style.display = '';
    }
}

function change_user_page(page) {
    if (typeof(Storage) !== 'undefined') {
        localStorage.setItem('user_page', page);
        user.page = page;
        change_page_elements_visibility();
    } else {
        alert(ERROR_LOCAL_STORAGE);
        return;
    }
}

function change_page_elements_visibility() {
    // hide previously shown page
    if (user.page === 'kaqueue') {
        document.getElementById('page_selector_queue_link_id').style.textShadow = '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black';
        document.getElementById('page_selector_svn_link_id').style.textShadow = 'none';
        document.getElementById('page_selector_list_link_id').style.textShadow = 'none';
        document.getElementById('page_selector_user_info_id').style.textShadow = 'none';
        document.getElementById('page_selector_admin_link_id').style.textShadow = 'none';

        document.getElementsByClassName('deliverylist')[0].style.display = 'none';
        document.getElementsByClassName('svncommits')[0].style.display = 'none';
        document.getElementsByClassName('userinfo')[0].style.display = 'none';
        document.getElementsByClassName('admin')[0].style.display = 'none';

        get_merge_queues();

    } else if (user.page === 'deliverylist') {
        document.getElementById('page_selector_list_link_id').style.textShadow = '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black';
        document.getElementById('page_selector_queue_link_id').style.textShadow = 'none';
        document.getElementById('page_selector_svn_link_id').style.textShadow = 'none';
        document.getElementById('page_selector_user_info_id').style.textShadow = 'none';
        document.getElementById('page_selector_admin_link_id').style.textShadow = 'none';

        document.getElementsByClassName('kaqueue')[0].style.display = 'none';
        document.getElementsByClassName('svncommits')[0].style.display = 'none';
        document.getElementsByClassName('userinfo')[0].style.display = 'none';
        document.getElementsByClassName('admin')[0].style.display = 'none';

        get_deliverylist_targets();

    } else if (user.page === 'svncommits') {
        document.getElementById('page_selector_svn_link_id').style.textShadow = '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black';
        document.getElementById('page_selector_queue_link_id').style.textShadow = 'none';
        document.getElementById('page_selector_list_link_id').style.textShadow = 'none';
        document.getElementById('page_selector_user_info_id').style.textShadow = 'none';
        document.getElementById('page_selector_admin_link_id').style.textShadow = 'none';

        document.getElementsByClassName('kaqueue')[0].style.display = 'none';
        document.getElementsByClassName('deliverylist')[0].style.display = 'none';
        document.getElementsByClassName('userinfo')[0].style.display = 'none';
        document.getElementsByClassName('admin')[0].style.display = 'none';

    } else if (user.page === 'userinfo') {
        document.getElementById('page_selector_user_info_id').style.textShadow = '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black';
        document.getElementById('page_selector_svn_link_id').style.textShadow = "none";
        document.getElementById('page_selector_queue_link_id').style.textShadow = 'none';
        document.getElementById('page_selector_list_link_id').style.textShadow = 'none';
        document.getElementById('page_selector_admin_link_id').style.textShadow = 'none';

        document.getElementsByClassName('kaqueue')[0].style.display = 'none';
        document.getElementsByClassName('deliverylist')[0].style.display = 'none';
        document.getElementsByClassName('svncommits')[0].style.display = 'none';
        document.getElementsByClassName('admin')[0].style.display = 'none';

        document.getElementById('userinfo_title_id').innerHTML = user.title;
        document.getElementById('userinfo_name_id').innerHTML = user.name + ' ' + user.surname;
        document.getElementById('userinfo_arris_id').innerHTML = user.arris_id;
        document.getElementById('userinfo_email_id').innerHTML = user.email;
        document.getElementById('userinfo_department_id').innerHTML = user.department;
        document.getElementById('userinfo_type_id').innerHTML = user.type;

    } else if (user.page === 'admin') {
        document.getElementById('page_selector_admin_link_id').style.textShadow = '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black';
        document.getElementById('page_selector_svn_link_id').style.textShadow = "none";
        document.getElementById('page_selector_queue_link_id').style.textShadow = 'none';
        document.getElementById('page_selector_list_link_id').style.textShadow = 'none';
        document.getElementById('page_selector_user_info_id').style.textShadow = 'none';

        document.getElementsByClassName('kaqueue')[0].style.display = 'none';
        document.getElementsByClassName('deliverylist')[0].style.display = 'none';
        document.getElementsByClassName('svncommits')[0].style.display = 'none';
        document.getElementsByClassName('userinfo')[0].style.display = 'none';

        get_admin_merge_queues_data();

    } else {
        alert('Unknown user page "' + user.page + '"');
        return;
    }

    // make page visible
    document.getElementsByClassName(user.page)[0].style.display = '';
}

function get_admin_merge_queues_data() {
    document.getElementById('link_processing_id').click();
    var post_data = {'operation': 'get_admin_merge_queues_data'};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: get_admin_merge_queues_data_error,
                 success: get_admin_merge_queues_data_result,
                 timeout: 10000});
}

function get_admin_merge_queues_data_error(xhr, textStatus, errorThrown) {
    click_close_window();
    alert('Uppps, Some error happaned ' + textStatus);
}

function get_admin_merge_queues_data_result(data) {
    // alert("get_admin_merge_queues_data_result:: " + JSON.stringify(data));
    // remove all previous rows/data from table
    var table = document.getElementById('admin_kaqueues_table_id');
    if (table.rows.length > 1) {
        for (var i = table.rows.length-1; i > 0; i--) {
            table.deleteRow(i);
        }
    }

    if ((data !== null) && (data !== undefined)) {
        if (data[0].success === true) {
            if (data.length > 1) {
                for (var i = 1; i < data.length; i++) {
                    var row = table.insertRow(i);
                    var cell0 = row.insertCell(0);
                    cell0.innerHTML = data[i]['NAME'];

                    var cell1 = row.insertCell(1);
                    cell1.innerHTML = data[i]['DESCRIPTION'].replace(/\s/gi, "<br>");

                    var cell2 = row.insertCell(2);
                    cell2.innerHTML = data[i]['TYPE'];

                    var cell3 = row.insertCell(3);
                    cell3.innerHTML = data[i]['STATUS'];

                    var cell4 = row.insertCell(4);
                    cell4.innerHTML = data[i]['OWNER'];

                    var cell5 = row.insertCell(5);
                    cell5.innerHTML = data[i]['APPROVALS'];

                    var cell6 = row.insertCell(6);
                    cell6.innerHTML = data[i]['DATE'];

                    var cell7 = row.insertCell(7);
                    cell7.innerHTML = "<img class='deliverylist_actions_img' src='img/edit_icon.png' onclick='edit_merge_queue(" + data[i]['ID'] + ")' alt='Edit' title='Edit " +  data[i]['NAME'] + "'>";
                    cell7.innerHTML += "<img class='deliverylist_actions_img' src='img/deactiv_icon.png' onclick='deactivate_merge_queue(" + data[i]['ID'] + ")' alt='Deactive' title='Deactive " + data[i]['NAME'] + "'>";
                    cell7.innerHTML += "<img class='deliverylist_actions_img' src='img/delete_icon.png' onclick='remove_merge_queue(" + data[i]['ID'] + ")' alt='Remove' title='Remove " + data[i]['NAME'] + "'>";
                }
            }
        }
    }

    click_close_window();
}

function get_merge_queues() {
    document.getElementById('link_processing_id').click();

    // remove all all merge queues from the list
    // var tab_list = document.getElementById('kaqueue_tab_id');
    if (kaqueues.length > 0) {
        for (var i = 0; i < kaqueues.length; i++) {
            var elem = document.getElementById(kaqueues[i]);
            elem.parentNode.removeChild(elem);
        }
        kaqueues = []; 
    }

    var post_data = {'operation': 'get_active_kaqueues',
                     'selected_queue': user.queue};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: get_merge_queues_error,
                 success: get_merge_queues_result,
                 timeout: 10000});
}

function get_merge_queues_error(xhr, textStatus, errorThrown) {
    // close procesing/in progress window
    click_close_window();
}

function get_merge_queues_result(data) {
    // alert(JSON.stringify(data));
    if ((data !== null) && (data !== undefined)) {
        if (data[0].success === true) {
            var tab_list = document.getElementById('kaqueue_tab_id');
            if (data.length > 1) {
                for (var i = 1; i < data.length; i++) {
                    var node = document.createElement("LI");
                    // node.innerHTML = "<a id='" + data[i]['NAME'] + "' href='javascript:void(0)' onclick='open_queue(\"" + data[i]['NAME'] + "\")'>" + data[i]['NAME'] + "</a>";
                    node.innerHTML = "<a id='" + data[i]['NAME'] + "' href='#' onclick='open_queue(\"" + data[i]['NAME']
                                   + "\", \"" + data[i]['TYPE'] + "\")'>" + data[i]['NAME'] + "</a>";
                    if (user.queue === data[i]['NAME']) {
                        var add_btn = document.getElementById('kaqueue_add_btn_id');
                        var add_msg = document.getElementById('kaqueue_add_msg_id');
                        if (data[i]['TYPE'] === 'FREE') {
                            add_btn.style.display = '';
                            add_msg.style.display = 'none';
                        } else {
                            add_btn.style.display = 'none';
                            add_msg.style.display = '';
                        }

                        node.style.backgroundColor = "#ccc";
                        get_merge_queue_data(user.queue);
                    } else {
                        node.style.backgroundColor = "#f1f1f1";
                    }
                    tab_list.appendChild(node);
                    kaqueues.push(data[i]['NAME']);
                }
            }
        }
    }
    click_close_window();
}

function get_deliverylist_targets() {
    document.getElementById('link_processing_id').click();
    if (user.type === 'USER') {
        document.getElementById('deliverylist_target_buttons_edit').style.visibility = 'hidden';
        document.getElementById('deliverylist_target_buttons_delete').style.visibility = 'hidden';
        document.getElementById('deliverylist_target_buttons_archive').style.visibility = 'hidden';
        document.getElementById('deliverylist_target_buttons_create').style.visibility = 'hidden';
    }

    // request delivery list data from server
    var post_data = {'operation': 'get_deliverylist_targets',
                     'archived': user.dls_archi,
                     'age': user.dls_age,
                     'queue': user.dls_queue};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: get_deliverylist_targets_error,
                 success: get_deliverylist_targets_result,
                 timeout: 10000});
}

function get_deliverylist_targets_error(xhr, textStatus, errorThrown) {
    // close procesing/in progress window
    click_close_window();
    /*alert('get_deliverylist_targets_error, xhr.status ' + xhr.status + ', textStatus '
        + textStatus + ', errorThrown ' + errorThrown);*/
}

function get_deliverylist_targets_result(data) {
    // alert('get_deliverylist_targets_result ' + JSON.stringify(data));
    // close procesing/in progress window
    click_close_window();
    if ((data !== null) && (data !== undefined)) {
        if (data[0].success === true) {
            var select = document.getElementById('deliverylist_target_select_id');
            // remove all previous options from select
            if (select.length > 1) {
                for (var i = select.length; i > 0; i--) {
                    select.remove(i-1);
                }
            }

            if (data.length > 1) {
                var index = 0; // selectedIndex property
                for (var i = 1; i < data.length; i++) {
                    var option = document.createElement("option");
                    option.value = data[i]['ID'];
                    option.text = data[i]['NAME'];
                    // if (parseInt(user.target_id) === parseInt(data[i]['ID'])) {
                    if (user.target_name === data[i]['NAME']) {
                        index = i - 1;
                    }
                    select.add(option);
                }
                select.selectedIndex = index;
                get_target_content(data[index+1]['ID'], data[index+1]['NAME']);

            } else {
                // remove all previous rows/data from table
                var table = document.getElementById('deliverylist_table_id');
                if (table.rows.length > 1) {
                    for (var i = table.rows.length-1; i > 0; i--) {
                        table.deleteRow(i);
                    }
                }

                document.getElementById('deliverylist_target_buttons_edit').style.visibility = 'hidden';
                document.getElementById('deliverylist_target_buttons_delete').style.visibility = 'hidden';
                document.getElementById('deliverylist_target_buttons_archive').style.visibility = 'hidden';

                var text = document.getElementById('warning_text_id');
                text.innerHTML = "Server returned EMPTY data.<br><br>Please, check "
                                 + "your Delivery list settings filter.<br><br>Your "
                                 + "current setting:<br><br>Show archived targets: "
                                 + user.dls_archi + "<br>Creation date: " + user.dls_age
                                 + "<br>Queue filter: " + user.dls_queue;
                document.getElementById('link_warning_id').click();
            }
        } else {
            alert('ERROR (get_deliverylist_targets_result): operation result '
                + data[0].success + ', error ' + data[0].error);
        }
    } else {
        alert('ERROR (get_deliverylist_targets_result): No data');
    }
}

function archive_target(target_id) {
    var post_data = {'operation': 'archive_target',
                     'target_id': target_id,
                     'archived': user.dls_archi,
                     'age': user.dls_age,
                     'queue': user.dls_queue};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: get_deliverylist_targets_error,
                 success: get_deliverylist_targets_result,
                 timeout: 10000});
}

function delete_target(target_id, target_name) {
    document.getElementById('removal_target_id').value = target_id;
    document.getElementById('removal_target_name').value = target_name;
    document.getElementById('remove_target_text_id').innerHTML = 'Do you want to remove ' + target_name + '?';
    document.getElementById('link_remove_target_id').click();
}

function remove_target_from_db() {
    var target_id = document.getElementById('removal_target_id').value;
    var target_name = document.getElementById('removal_target_name').value;

    // POST data
    var post_data = {'operation': 'remove_target_from_db',
                     'target_id': target_id,
                     'target_name': target_name,
                     'archived': user.dls_archi,
                     'age': user.dls_age,
                     'queue': user.dls_queue};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: get_deliverylist_targets_error,
                 success: get_deliverylist_targets_result,
                 timeout: 10000});

    click_close_window();
    document.getElementById('link_processing_id').click();
}

function add_new_target(target_id, name, queue, subscribers) {
    document.getElementById('new_target_id').value = target_id;

    // if target_id === 0, it's a new target
    // else it's edit action of existed target
    var selected_queue = '';
    if (target_id === 0) {
        selected_queue = user.queue;
    } else {
        selected_queue = queue;
    }

    // POST data
    var post_data = {'operation': 'get_active_kaqueues',
                     'selected_queue': selected_queue};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: get_active_kaqueues_error,
                 success: get_active_kaqueues_result,
                 timeout: 10000});

    if (target_id !== 0) {
        document.getElementById('new_target_title_id').innerHTML = 'Target name:';

        document.getElementById('new_target_name_id').value = name;
        var subs = document.getElementById('new_target_subscribers_id');
        subs.value = '';
        if (subscribers.indexOf(',') !== -1) {
            var sbs = subscribers.split(',');
            for (var i = 0; i < sbs.length; i++) {
                if (sbs[i].trim().length > 1) {
                    subs.value += sbs[i].trim() + ',\n';
                }
            }
        } else {
            subs.value = subscribers;
        }

    } else {
        document.getElementById('new_target_title_id').innerHTML = 'New target name:';
        document.getElementById('new_target_name_id').value = '';
        document.getElementById('new_target_subscribers_id').value = '';
    }
    // document.getElementById('link_processing_id').click();
}

function get_active_kaqueues_error(xhr, textStatus, errorThrown) {
    // close procesing/in progress window
    click_close_window();
    alert('get_active_kaqueues_error, xhr.status ' + xhr.status + ', textStatus '
        + textStatus + ', errorThrown ' + errorThrown);
}

function get_active_kaqueues_result(data) {
    // alert('get_kaqueues_result ' + JSON.stringify(data));
    click_close_window();
    if ((data !== null) && (data !== undefined)) {
        if (data[0].success === true) {
            var select = document.getElementById('new_target_queue_id');
            // remove all previous options from select
            if (select.length > 1) {
                for (var i = select.length; i > 0; i--) {
                    select.remove(i-1);
                }
            }

            if (data.length > 1) {
                var index = 0; // selectedIndex property
                for (var i = 1; i < data.length; i++) {
                    var option = document.createElement("option");
                    option.value = data[i]['NAME'];
                    option.text = data[i]['NAME'];
                    if (data[0].selected_queue === data[i]['NAME']) {
                        index = i - 1;
                    }
                    select.add(option);
                }
                select.selectedIndex = index;
            }

            // click by hided link to open place_in_queue block
            document.getElementById('link_add_new_target_id').click();
        } else {
            alert('ERROR (get_active_kaqueues_result): operation result '
                + data[0].success + ', error ' + data[0].error);
        }
    }
}

function kaqueue_select_event() {
    var queue = document.getElementById('new_target_queue_id').value;
    set_target_subscribers(queue);
}

function set_target_subscribers(queue) {
    var subscribers = document.getElementById('new_target_subscribers_id');
    if (queue.indexOf('Alder') !== -1) {
        subscribers.value = 'Art.Jost@arris.com,\nAbhijit.Chatterjee@arris.com,\nRichard.Rementilla@arris.com,\nBill.CarpenterIII@arris.com,\n';
    } else if (queue.indexOf('Ftr') !== -1) {
        subscribers.value = 'Art.Jost@arris.com,\nAbhijit.Chatterjee@arris.com,\nRichard.Rementilla@arris.com,\nBill.CarpenterIII@arris.com,\n';
    } else if (queue.indexOf('Elm') !== -1) {
        subscribers.value = 'Rath.Shetty@arris.com,\nArt.Jost@arris.com,\nAbhijit.Chatterjee@arris.com,\nRichard.Rementilla@arris.com,\nBill.CarpenterIII@arris.com,\n';
    } else {
        subscribers.value = 'Art.Jost@arris.com,\nAbhijit.Chatterjee@arris.com,\nRichard.Rementilla@arris.com,\nBill.CarpenterIII@arris.com,\n';
    }
}

function save_new_target() {
    var target_id = document.getElementById('new_target_id').value;
    if (target_id > 0) {
        user.target_id = target_id;
        localStorage.setItem('user_target_id', user.target_id);
    }

    var target_name = document.getElementById('new_target_name_id').value;
    target_name = target_name.replace(/[`~!@#$%^&*()|+\=?'"<>\n]/gi, '');
    if (target_name.length < 1) {
        alert('Please, provide correct target name');
        return;
    }
    var queue = document.getElementById('new_target_queue_id').value;
    if (queue.length < 1) {
        alert('Please, provide correct description/JIRA title');
        return;
    }

    var subscribers = document.getElementById('new_target_subscribers_id').value;
    subscribers = subscribers.replace(/[`~!#$%^&*()|+\=?;:'"<>\n\{\}\[\]\\\/]/gi, '');
    if (subscribers.length < 1) {
        alert('Please, provide the valid list of subscribers');
        return;
    }

    // set user queue based on created new target value
    if (target_id !== 0) {
        user.target_id = target_id;
        localStorage.setItem('user_target_id', user.target_id);
    }
    user.queue = queue; user.target_name = target_name;
    localStorage.setItem('user_queue', user.queue);
    localStorage.setItem('user_target_name', target_name);

    var post_data = {'operation': 'add_new_target',
                     'target_id': target_id,
                     'target_name': target_name,
                     'creator': user.email,
                     'queue': queue,
                     'subscribers': subscribers,
                     'dls_archived': user.dls_archi,
                     'dls_age': user.dls_age,
                     'dls_queue': user.dls_queue};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: get_deliverylist_targets_error,
                 success: get_deliverylist_targets_result,
                 timeout: 10000});

    // close current '#new_target' window and open processing
    click_close_window();
    document.getElementById('link_processing_id').click();
}

function deliverylist_select_event() {
    document.getElementById('link_processing_id').click();

    var target_id = document.getElementById('deliverylist_target_select_id').value;
    localStorage.setItem('user_target_id', target_id);
    user.target_id = target_id;

    var index = document.getElementById('deliverylist_target_select_id').selectedIndex;
    var target_name = document.getElementById('deliverylist_target_select_id').options[index].text;
    localStorage.setItem('user_target_name', target_name);
    user.target_name = target_name;

    get_target_content(target_id, target_name);
}

function get_target_content(target_id, target_name) {
    // alert('get_target_content ' + target_id + ', target_name ' + target_name);
    // POST data
    var post_data = {'operation': 'get_target_content',
                     'target_id': target_id,
                     'target_name': target_name};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: get_target_content_error,
                 success: get_target_content_result,
                 timeout: 10000});
}

function get_target_content_error(xhr, textStatus, errorThrown) {
    // close procesing/in progress window
    click_close_window();
    alert('get_target_content_error, xhr.status ' + xhr.status + ', textStatus '
        + textStatus + ', errorThrown ' + errorThrown);
}

function get_target_content_result(data) {
    // alert('get_target_content_result ' + JSON.stringify(data));
    // close procesing/in progress window
    click_close_window();
    if ((data !== null) && (data !== undefined)) {
        if (data[0].success === true) {
            var table = document.getElementById('deliverylist_table_id');
            // remove all previous rows/data from table
            if (table.rows.length > 1) {
                for (var i = table.rows.length-1; i > 0; i--) {
                    table.deleteRow(i);
                }
            }

            if (data.length > 1) {
                // change EDIT and ARCHIVE buttons here
                if (user.type !== 'USER') {
                    var btn_delete = document.getElementById('deliverylist_target_buttons_delete');
                    btn_delete.style.visibility = 'visible';
                    btn_delete.onclick = function () {
                        delete_target(data[1]["ID"], data[1]["NAME"]);
                    };
                    var btn_edit = document.getElementById('deliverylist_target_buttons_edit');
                    btn_edit.style.visibility = 'visible';
                    btn_edit.onclick = function () {
                        add_new_target(data[1]["ID"], data[1]["NAME"], data[1]["QUEUE"], data[1]["SUBSCRIBERS"]);
                    };
                    var btn_archive = document.getElementById('deliverylist_target_buttons_archive');
                    btn_archive.style.visibility = 'visible';
                    btn_archive.onclick = function () {
                        archive_target(data[1]["ID"]);
                    };
                }

                // save user data in vars and localstorage
                user.target_id = data[1]["ID"];
                user.target_name = data[1]["NAME"];
                user.queue = data[1]["QUEUE"];
                localStorage.setItem('user_target_id', user.target_id);
                localStorage.setItem('user_target_name', user.target_name);
                localStorage.setItem('user_queue', user.queue);
            }

            if (data.length > 2) {
                var current_table_index = 1; // i starts from 2, when table has only 1 row
                for (var i = 2; i < data.length; i++) {
                    var row = table.insertRow(current_table_index);
                    var cell0 = row.insertCell(0);
                    cell0.innerHTML = '';
                    if (data[i].approval_status.indexOf('Delivered') !== -1) {
                        cell0.innerHTML += "<b>Delivered</b><br>";
                        cell0.style.backgroundColor = "#FFFFAA";
                        // cell0.innerHTML += '<button class="queue_commits_button" onclick="change_delivery_status()"><b>Delivered</b></button><br>';
                        var details = data[i].approval_status.split(',');
                        if (details.length > 1) {
                            cell0.innerHTML += "<a href='http://svn.arrisi.com/commits_by_num.php?rev=" + details[1] + "'><b>" + details[1] + "</b></a><br>";
                        } else {
                            cell0.innerHTML += "<b>No revision</b><br>";
                        }
                    } else if (data[i].approval_status.indexOf('Good') !== -1) {
                        cell0.innerHTML += "<b style='color:white;'>Good to GO</b><br>";
                        cell0.style.backgroundColor = "#008000";
                        // cell0.style.backgroundColor = "#E0FFE0";
                        // cell0.innerHTML += '<button class="queue_commits_button" onclick="change_delivery_status()"><b>Good to GO</b></button><br>';

                        // click_add_in_queue(id, target_id, queue, jira, review, email, description, branch)
                        var vals = "0, " + data[i]['id'] + ", '" + user.queue + "', '" + data[i]['jiraid']
                            + "', '" + data[i]['review'] + "', '" + data[i]['assignee'] + "', '"
                            + encodeURI(data[i]['jira_summary']) + "', '" + data[i]['project'] + "'";
                        cell0.innerHTML += '<button class="queue_commits_button" onclick="click_add_in_queue(' + vals + ')"><b>place in queue</b></button><br>';
                    } else if (data[i].approval_status.indexOf('queue') !== -1) {
                        cell0.innerHTML += "<b style='color:white;'>In Merge Queue</b><br>";
                        cell0.style.backgroundColor = "#ffa500";
                        //cell0.style.backgroundColor = "#f7daa5";

                    } else {
                        cell0.innerHTML += "<b style='color:white;'>Not approved</b><br>";
                        cell0.innerHTML += '<button class="queue_commits_button" onclick="approve_delivery(' + data[i].id + ')"><b>Approve</b></button><br>';
                        // cell0.style.backgroundColor = "#ffe6e6";
                        cell0.style.backgroundColor = "#ff0000";
                    }
                    cell0.innerHTML += '<button class="queue_commits_button" onclick="edit_approval_status(' + data[i].id + ')"><b>Edit</b></button>';

                    var cell1 = row.insertCell(1);
                    cell1.innerHTML = get_jira_cell(data[i]['jiraid']);

                    var cell2 = row.insertCell(2);
                    cell2.innerHTML = get_review_cell(data[i]['review']);

                    var cell3 = row.insertCell(3);
                    cell3.style.textAlign = 'left';
                    cell3.innerHTML = data[i]['jira_summary'];

                    var cell4 = row.insertCell(4);
                    cell4.style.textAlign = 'left';
                    cell4.innerHTML = data[i]['delivery_comments'];

                    var cell5 = row.insertCell(5);
                    cell5.innerHTML = get_user_email_cell(data[i]['assignee']);

                    var cell6 = row.insertCell(6);
                    cell6.innerHTML = get_user_email_cell(data[i]['jira_priority']);

                    var cell7 = row.insertCell(7);
                    cell7.innerHTML = get_user_email_cell(data[i]['customer_priority']);

                    var cell8 = row.insertCell(8);
                    cell8.innerHTML = get_user_email_cell(data[i]['functional_area']);

                    var cell9 = row.insertCell(9);
                    cell9.innerHTML = get_user_email_cell(data[i]['regression']);

                    var cell10 = row.insertCell(10);
                    cell10.style.textAlign = 'left';
                    cell10.innerHTML = get_user_email_cell(data[i]['additional_comments']);

                    var cell11 = row.insertCell(11);
                    cell11.innerHTML = "<img class='deliverylist_actions_img' src='img/edit_icon.png' onclick='edit_delivery(" + data[i].id + ")' alt='edit' title='Edit delivery'>";
                    cell11.innerHTML += "<img class='deliverylist_actions_img' src='img/copy_icon.png' onclick='copy_move_delivery(" + data[i].id  + ", " + current_table_index + ", \"copy\")' alt='copy' title='Copy delivery'>";
                    cell11.innerHTML += "<img class='deliverylist_actions_img' src='img/move_icon.png' onclick='copy_move_delivery(" + data[i].id  + ", " + current_table_index + ", \"move\")' alt='move' title='Move delivery'>";
                    cell11.innerHTML += "<img class='deliverylist_actions_img' src='img/delete_icon.png' onclick='remove_delivery(" + data[i].id + ", " + current_table_index + ")' alt='remove' title='Remove delivery'>";

                    current_table_index++;
                }
            } else {
                var row = table.insertRow(table.rows.length);
                var cell = row.insertCell(0);
                cell.style.width = '100%';
                cell.colSpan = '12';
                cell.innerHTML = '<b>No data/deliveries in ' + user.target_name + '</b>';
            }
        } else {
            // data.success === false, some error occurred
            alert('ERROR (get_target_content_result): operation result '
                + data[0].success + ', error ' + data[0].error);
        }
    }
}

function click_close_window() {
    // click by hided link to close window
    document.getElementById('link_close_window').click();
}

/**
 * Read user information from localstorage
 *
 * @return {boolean} True if information existed
 */
function get_local_user_info() {
    // use HTML5 Local Storage if browser supports it
    var user_keys = Object.keys(user);

    // use HTML5 Local Storage if browser supports it
    if (typeof(Storage) !== "undefined") {
        for (var i = 0; i < user_keys.length; i++) {
            var storage_key = 'user_' + user_keys[i];
            var storage_val = localStorage.getItem(storage_key);
            if (storage_val === null && typeof storage_val === "object") {
                //alert('storage_key ' + storage_key + ', storage_val ' + storage_val);
                return false;

            } else if (storage_val === 'null') {
                // in case of server returned null values as strings
                return false;

            } else {
                user[user_keys[i]] = storage_val;
            }
        }
    } else {
        // TBD: implement cookies version later
        return false;
    }

    //alert(JSON.stringify(user));
    if ((user.arris_id.length === 0) ||
        (user.name.length === 0) ||
        (user.surname.length === 0) ||
        (user.email.length === 0)) {
            return false;
    }

    return true;
}

function validate_name(name) {
    if ((name.length < MIN_NAME_LENGTH) ||
        (name.length > MAX_NAME_LENGTH)) {
        alert("Name should have min length " + MIN_NAME_LENGTH
            + " chars and not more than " + MAX_NAME_LENGTH + " chars");
        return false;
    } else if (!NAME_PATTERN.test(name)) {
        alert("Name should contain only English characters");
        return false;
    }
    return true;
}

function validate_pswd(pswd) {
    if ((pswd.length < MIN_PSWD_LENGTH) ||
        (pswd.length > MAX_PSWD_LENGTH)) {
        alert("Password should have min " + MIN_PSWD_LENGTH
            + " length and not more than " + MAX_PSWD_LENGTH + " chars");
        return false;
    }
    return true;
}

function login() {
    var arris_id = document.getElementById('login_forms_arris_id').value;
    if (!validate_name(arris_id)) {
        return false;
    }

    var pswd = document.getElementById('login_forms_pswd_id').value;
    if (!validate_pswd(pswd)) {
        return false;
    }

    // POST data
    var post_data = {'operation': 'login',
                     'arris_id': arris_id,
                     'pswd': pswd};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: login_error,
                 success: login_result,
                 timeout: 25000});

    var user_logo_img = document.getElementById('login_user_image_id');
    user_logo_img.src = 'img/spinner.gif';
    user_logo_img.style.border = 'none';

    // disable all text fields
    document.getElementById('login_forms_arris_id').disabled = true;
    document.getElementById('login_forms_pswd_id').disabled = true;
    document.getElementById('login_button_id').disabled = true;

    // get the number of milliseconds since midnight, January 1, 1970
    current_time = (new Date()).getTime() + 2130;
}

/**
 * login_error(jqXHR jqXHR, String textStatus, String errorThrown)
 * A function to be called if LOGIN request failed. The function receives three
 * arguments:
 * The jqXHR (in jQuery 1.4.x, XMLHttpRequest) object, a string describing the
 * type of error that occurred and an optional exception object (if one occurred).
 * Possible values for the second argument (besides null) are "timeout", "error",
 * "abort", and "parsererror". When an HTTP error occurs, errorThrown receives the
 * textual portion of the HTTP status, such as "Not Found".
 */
function login_error(xhr, textStatus, errorThrown) {
    login_message('xhr.status ' + xhr.status + ', textStatus '
        + textStatus + ', errorThrown ' + errorThrown);
}

function login_result(data) {
    // alert('login_result ' + JSON.stringify(data));
    var response_time = (new Date()).getTime();
    var milliseconds = 0;
    if (response_time < current_time) {
        milliseconds = current_time - response_time;
    }

    if ((data !== null) && (data !== undefined)) {
        if (data.length > 0) {
            if (data[0].success !== false) {
                if (typeof(Storage) !== 'undefined') {
                    localStorage.setItem('user_arris_id', data[0].arris_id);
                    localStorage.setItem('user_name', data[0].name);
                    localStorage.setItem('user_surname', data[0].surname);
                    localStorage.setItem('user_email', data[0].email);
                    localStorage.setItem('user_title', data[0].title);
                    localStorage.setItem('user_department', data[0].department);

                    localStorage.setItem('user_id', data[1]['ID']);
                    localStorage.setItem('user_page', data[1]['PAGE']);
                    localStorage.setItem('user_queue', data[1]['QUEUE']);
                    localStorage.setItem('user_dls_archi', data[1]['DLS_ARCHI']);
                    localStorage.setItem('user_dls_age', data[1]['DLS_AGE']);
                    localStorage.setItem('user_dls_queue', data[1]['DLS_QUEUE']);
                    localStorage.setItem('user_target_id', data[1]['TARGET_ID']);
                    localStorage.setItem('user_target_name', data[1]['TARGET_NAME']);
                    localStorage.setItem('user_type', data[1]['TYPE']);

                    localStorage.setItem('user_queue_status', data[1]['QUEUE_STATUS']);
                    // 

                    setTimeout(function() {login_message('passed');}, milliseconds);

                } else {
                    setTimeout(function() {login_message(ERROR_LOCAL_STORAGE);}, milliseconds);
                }
            } else {
                setTimeout(function() {login_message(data.error);}, milliseconds);
            }
        } else {
            setTimeout(function() {login_message('Server returned empty login data');}, milliseconds);
        }
    } else {
        setTimeout(function() {login_message('Could not get login data from server');}, milliseconds);
    }
}

function login_message(message) {
    var user_logo_img = document.getElementById('login_user_image_id');
    user_logo_img.src = 'img/user_logo.jpg';
    user_logo_img.style.border = '1px solid black';

    document.getElementById('login_forms_arris_id').disabled = false;
    document.getElementById('login_forms_pswd_id').disabled = false;
    document.getElementById('login_button_id').disabled = false;
    var err = document.getElementById('login_error_id');
    if (message === 'passed') {
        err.style.visibility = 'hidden';
        err.innerHTML = '';
        refresh_data();
    } else {
        alert(message);
        err.style.visibility = 'visible';
        err.innerHTML = message;
    }
}

function open_queue(queue_name, queue_type) {
    // alert('queue_name ' + queue_name + ', kaqueues.length: ' + kaqueues.length);
    document.getElementById('link_processing_id').click();
    user.queue = queue_name; localStorage.setItem('user_queue', queue_name);
    for (var i = 0; i < kaqueues.length; i++) {
        var queue = document.getElementById(kaqueues[i]);
        if (queue_name === kaqueues[i]) {
            var add_btn = document.getElementById('kaqueue_add_btn_id');
            var add_msg = document.getElementById('kaqueue_add_msg_id');
            if (queue_type === 'FREE') {
                add_btn.style.display = '';
                add_msg.style.display = 'none';
            } else {
                add_btn.style.display = 'none';
                add_msg.style.display = '';
            }
            queue.style.backgroundColor = "#ccc";
        } else {
            queue.style.backgroundColor = "#f1f1f1";
        }
    }
    get_merge_queue_data(queue_name);
}

function get_merge_queue_data(queue_name) {
    document.getElementById('link_processing_id').click();
    // POST data
    var post_data = {'operation': 'get_merge_queue_data',
                     'queue': queue_name};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: get_merge_queue_data_error,
                 success: get_merge_queue_data_result,
                 timeout: 10000});
}

/**
  * ( jqXHR jqXHR, String textStatus, String errorThrown )
  * A function to be called if the request fails, receives three arguments:
  * The jqXHR (in jQuery 1.4.x, XMLHttpRequest) object, a string describing the
  * type of error that occurred and an optional exception object, if one occurred.
  * Possible values for the second argument (besides null) are "timeout", "error",
  * "abort", and "parsererror". When an HTTP error occurs, errorThrown receives
  * the textual portion of the HTTP status, such as "Not Found" or "Internal Server
  * Error." As of jQuery 1.5, the error setting can accept an array of functions.
  * Each function will be called in turn. Note: This handler is not called for
  * cross-domain script and cross-domain JSONP requests. This is an Ajax Event.
  */
function get_merge_queue_data_error(jqXHR, textStatus, errorThrown) {
    // alert('get_merge_queue_data_error, textStatus = ' + textStatus); 
}

function get_merge_queue_data_result(data) {
    // alert('get_merge_queue_data_result ' + JSON.stringify(data));
    var table = document.getElementById('kaqueue_table_id');
    // remove all previous rows if existed (except of table headers, row id 0)
    if (table.rows.length > 1) {
        for (var i = table.rows.length-1; i > 0; i--) {
            table.deleteRow(i);
        }
    }

    if ((data !== null) && (data !== undefined)) {
        if ((data[0] !== undefined) && (data[0].success === true)) {
            if (data.length > 1) {
                for (var i = 1; i < data.length; i++) {
                    var row = table.insertRow(i);
                    var cell0 = row.insertCell(0);
                    // branches/KA_trunk_KATV-19728
                    var branch = data[i]['BRANCH'].substring(9, data[i]['BRANCH'].length);
                    cell0.innerHTML = "<a href='http://svn.arrisi.com/overview.php?"
                        + "action=branchinfo&age=7&branch=" + data[i]['BRANCH']
                        + "' target='_blank' title='" + branch + " Branch overview'>"
                        + branch + "</a><br><a href='http://svn.arrisi.com/commits.php?repo=dev&"
                        + "project=bsg&branch=" + data[i]['BRANCH'] + "&age=7&"
                        + "merges=yes&action=search' title='7 days of " + branch
                        + " commits'><img src='img/mini_page.jpg'></a>";

                    var cell1 = row.insertCell(1);
                    cell1.innerHTML = get_user_email_cell(data[i]['EMAIL']);

                    var cell2 = row.insertCell(2);
                    cell2.style.textAlign = 'left';
                    cell2.innerHTML = data[i]['DESCRIPTION'];

                    var cell3 = row.insertCell(3);
                    cell3.innerHTML = get_jira_cell(data[i]['JIRA']);

                    var cell4 = row.insertCell(4);
                    cell4.innerHTML = get_review_cell(data[i]['REVIEW']);

                    var cell5 = row.insertCell(5);
                    cell5.id = 'id_' + data[i]['ID'] + '_build';
                    cell5.innerHTML = "<img style='width:40%;' src='img/spinner.gif'>";
                    get_builds_data_from_svn(data[i]['BRANCH'], data[i]['ID']);

                    var cell6 = row.insertCell(6);
                    cell6.id = 'id_' + data[i]['ID'] + '_level1';
                    cell6.innerHTML = "<img style='width:40%;' src='img/spinner.gif'>";

                    var cell7 = row.insertCell(7);
                    cell7.id = 'id_' + data[i]['ID'] + '_level2';
                    cell7.innerHTML = "<img style='width:40%;' src='img/spinner.gif'>";

                    var cell8 = row.insertCell(8);
                    cell8.id = 'id_' + data[i]['ID'] + '_level98';
                    cell8.innerHTML = "<img style='width:40%;' src='img/spinner.gif'>";

                    var cell9 = row.insertCell(9);
                    cell9.id = 'id_' + data[i]['ID'] + '_smokes';
                    cell9.innerHTML = "<img style='width:40%;' src='img/spinner.gif'>";

                    var cell10 = row.insertCell(10);
                    cell10.innerHTML = '';
                    if (i === 1) {
                        var t1 = new Date(data[0]['current_date']);
                        var t2 = new Date(data[i]['DATE']);
                        var diff = parseInt(t1 - t2);
                        var days = parseInt(diff/(1000 * 60 * 60 * 24)); // 86400000 ms
                        var hours = parseInt(((diff - (days*86400000))/(1000 * 60 * 60))); // 3600000 ms
                        var mins = parseInt((diff - (days*86400000) - (hours*3600000))/(1000*60));
                        cell10.innerHTML += '<b>Merging time:<br>' + days + ' days, ' + hours + ' hours, ' + mins + ' mins</b>';
                    }
                    cell10.innerHTML += '<p>' + data[i]['DATE'] + '</p>';

                    var cell11 = row.insertCell(11);
                    cell11.innerHTML = '';
                    if ((i < data.length-1) && (data.length > 2)) {
                        var vals = "'down', " + data[i]['ID'] + ", " + data[i+1]['ID'] + ", '" + data[i]['QUEUE'] + "'";
                        cell11.innerHTML += '<button class="queue_commits_button" onclick="click_up_down_in_queue(' + vals + ')"><b>down</b></button><br>';
                    }
                    if ((i > 1) && (data.length > 2)) {
                        var vals = "'up', " + data[i]['ID'] + ", " + data[i-1]['ID'] + ", '" + data[i]['QUEUE'] + "'";
                        cell11.innerHTML += '<button class="queue_commits_button" onclick="click_up_down_in_queue(' + vals + ')"><b>up</b></button><br>';
                    }
                    // click_add_in_queue(id, target_id, queue, jira, review, email, description, branch)
                    var vals = data[i]['ID'] + ", " + data[i]['TARGET_ID'] + ", '"
                        + data[i]['QUEUE'] + "', '" + data[i]['JIRA'] + "', '"
                         + data[i]['REVIEW'] + "', '" + data[i]['EMAIL'] + "', '"
                         + data[i]['DESCRIPTION'] + "', '" + data[i]['BRANCH'] + "'";
                    cell11.innerHTML += '<button class="queue_commits_button" onclick="click_add_in_queue(' + vals + ')"><b>edit</b></button><br>';
                    cell11.innerHTML += '<button class="queue_commits_button" onclick="delete_from_queue(' + data[i]['ID'] + ')"><b>delete</b></button>';
                }

            } else {
                var row = table.insertRow(table.rows.length);
                var cell = row.insertCell(0);
                cell.colSpan = "12";
                cell.innerHTML = "<b>" + user.queue + " merge queue is empty</b>";
            }

        } else {
            // data.success === false, some error occurred

        }
    }
    click_close_window();
}

function get_builds_data_from_svn(branch, link_id) {
    // alert(JSON.stringify(data));
    var post_data = {'operation': 'get_builds_data_from_svn',
                     'branch': branch,
                     'link_id': link_id};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: get_builds_data_from_svn_error,
                 success: get_builds_data_from_svn_result,
                 timeout: 25000});
}

function get_builds_data_from_svn_error() {

}

function get_builds_data_from_svn_result(data) {
    // alert('get_builds_data_from_svn_result ' + JSON.stringify(data));
    if ((data !== null) && (data !== undefined)) {
        if (data[0].success === true) {
            var revision = document.getElementById('id_' + data[0].link_id + '_build');
            if (revision !== null) {
                revision.innerHTML = '';
                if (data.length > 1) {
                    for (var i = 1; i < data.length; i++) {
                        var status = data[i]['total_status'];
                        var style = 'background:#E0FFE0;';
                        if (status === 'status_fail') {
                            status = 'FAILED';
                            style = 'background:#FFE0E0;';
                        } else if (status === 'status_warn') {
                            status = 'FAILED';
                            style = 'background:#FFFFAA;';
                        } else if (status === 'in_queue') {
                            status = 'IN QUEUE';
                            style = 'background:#FFFFFF;';
                        } else if (status === 'status_queued') {
                            status = 'IN QUEUE';
                            style = 'background:#FFFFFF;';
                        } else if (status === 'status_running') {
                            status = 'RUNNING';
                            style = 'background:#FFFFFF;';
                        } else if (status === 'status_unknown') {
                            status = 'waiting';
                            style = 'background:#F0F0F0;';
                        } else if (status === 'status_ok') {
                            status = 'PASSED';
                            style = 'background:#E0FFE0;';
                        }

                        revision.innerHTML += "<p style='" + style + "'><a href='http://"
                            + data[i]['build_host'] + ".lab.swelin.arrisi.com/build.php?id="
                            + data[i]['id'] + "' title='Build results'>" + data[i]['revision']
                            + "</a><br><b>" + status + "</b></p>";
                        get_katt_results(data[i]['revision'], data[0].branch, data[0].link_id);
                    }
                } else {
                    revision.innerHTML = "<p style='background:#FFE0E0;'><b>No builds/revisions found</b></p>";
                }
            }
        }
    }
}

function get_katt_results(revision, branch, link_id) {
    var post_data = {'operation': 'get_katt_results',
                     'revision': revision,
                     'branch': branch,
                     'link_id': link_id};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 success: get_katt_results_result});
}

function get_katt_results_result(data) {
    // alert('get_katt_results_result ' + JSON.stringify(data));
    if ((data !== null) && (data !== undefined)) {
        if (data[0].success === true) {
            // data[0].link_id = 1_level_1, 1_level_2 etc.
            for (var i = 1; i < data.length; i++) {
                var level = document.getElementById('id_' + data[i].link_id);
                if (level !== null) {
                    if (data[i].katt_result !== undefined) {
                        if (data[i].katt_result.length === 0) {
                            var status = "No results"
                            var style = 'background:#FFFFFF;';
                            var details = '';
                        } else {
                            // branches/KA_trunk 599086 Currently running (0/0/0/0)
                            var mess = data[i].katt_result.split(" ");
                            var status = mess[2] + ' ' + mess[3];
                            var details = mess[4];
                            var style = 'background:#E0FFE0;';
                            if (status === 'All passed') {
                                status = "<b>PASSED</b>"
                                style = 'background:#E0FFE0;';
                            } else if (status === 'Currently running') {
                                status = "<b>running</b>"
                                style = 'background:yellow;';
                                details = '';
                            } else {
                                status = "<b>FAILED</b>"
                                style = 'background:#FFE0E0;';
                            }
                        }
                    } else if (data[i].smokes_results !== undefined) {
                        if (data[i].smokes_results.length === 0) {
                            var status = "No results"
                            var style = 'background:#FFFFFF;';
                            var details = '';
                        } else if (data[i].smokes_results.indexOf('PASS') !== -1) {
                            var status = "<b>PASSED</b>";
                            var style = 'background:#E0FFE0;';
                            var details = '';
                        } else {
                            var status = "<b>FAILED</b>";
                            var style = 'background:#FFE0E0;';
                            var details = '';
                        }
                    }

                    // cell7.innerHTML = "<img style='width:40%;' src='img/spinner.gif'>";
                    if (level.innerHTML.indexOf('spinner') === -1) {
                        level.innerHTML += "<p style='" + style + "'>" + data[0].revision + '<br>' + status + "<br><b>" + details + "</b></p>";
                    } else {
                        level.innerHTML = "<p style='" + style + "'>" + data[0].revision + '<br>' + status + "<br><b>" + details + "</b></p>";
                    }
                }
            }
        }
    }
}

function get_user_email_cell(user) {
    var index = user.indexOf('@');
    if (index > 0) {
        var first = user.substring(0, index);
        var secnd = first.replace(".", " ");
        return "<a href='mailto:" + user + "'>" + secnd + "</a>";
    } else {
        return user;
    }
}

function get_approval_cell(approval_status) {
    var status = '';
    return status;
}

function get_jira_cell(jira) {
    var return_value = '';
    var jiras = jira.split(',');
    for (var i = 0; i < jiras.length; i++) {
        var vlt = jiras[i].trim();
        return_value += "<a href='http://odart.arrisi.com/browse/" + vlt + "'>" + vlt + '</a><br>';
    }
    return return_value;
}

function get_review_cell(review) {
    var return_value = '';
    var reviews = review.split(',');
    for (var i = 0; i < reviews.length; i++) {
        var curr_rev = reviews[i];
        // http://reviewboard.ea.mot.com/r/20241
        if (curr_rev.indexOf('ea.mot.com') !== -1) {
            curr_rev = curr_rev.replace('ea.mot.com', 'arrisi.com');
        }

        if (curr_rev.indexOf('http:') !== -1) {
            // http://review.arrisi.com/r/33615
            var numbers = reviews[i].substring(27, curr_rev.length);
            return_value += "<a href='" + curr_rev + "'>" + numbers + "</a><br>";

        } else if (curr_rev.indexOf('https:') !== -1) {
            // https://review.arrisi.com/r/33615
            var numbers = curr_rev.substring(28, curr_rev.length);
            return_value += "<a href='" + curr_rev + "'>" + numbers + "</a><br>";

        } else if (Number.isInteger(curr_rev)) {
            return_value += "<a href='http://review.arrisi.com/r/" + curr_rev + "'>" + curr_rev + "</a><br>";

        } else {
            return_value += curr_rev + "<br>";
        }
    }
    return return_value;
}

function show_admin_settings() {
    if (user.queue_status === 'yes') {
        document.getElementById('admin_checkbox_id').checked = true;
    } else {
        document.getElementById('admin_checkbox_id').checked = false;
    }

    // show processing screen for some, while receive data
    document.getElementById('link_admin_settings_id').click();
}

function save_admin_settings() {
    alert('WRAPPER: save_admin_settings SAVED');
}

function show_deliverylist_settings() {
    if (user.dls_archi === 'yes') {
        document.getElementById('dls_checkbox_id').checked = true;
    } else {
        document.getElementById('dls_checkbox_id').checked = false;
    }
    document.getElementById('dls_settings_age').value = user.dls_age;
    document.getElementById('dls_settings_queue').value = user.dls_queue;

    var post_data = {'operation': 'get_all_kaqueues'};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: get_all_kaqueues_error,
                 success: get_all_kaqueues_result,
                 timeout: 10000});
    // show processing screen for some, while receive data
    document.getElementById('link_processing_id').click();
}

function get_all_kaqueues_error(xhr, textStatus, errorThrown) {
    // click close processing screen
    click_close_window();
    alert('get_all_kaqueues_error, xhr.status ' + xhr.status + ', textStatus '
          + textStatus + ', errorThrown ' + errorThrown);
}

function get_all_kaqueues_result(data) {
    // click close processing screen
    click_close_window();
    if ((data !== null) && (data !== undefined)) {
        if (data[0].success === true) {
            var select = document.getElementById('dls_settings_queue');
            // remove all previous options from select
            if (select.length > 1) {
                for (var i = select.length; i > 0; i--) {
                    select.remove(i-1);
                }
            }

            var option = document.createElement("option");
            option.value = 'All'; option.text = 'All';
            select.add(option);

            if (data.length > 1) {
                var index = 0; // selectedIndex property
                for (var i = 1; i < data.length; i++) {
                    option = document.createElement("option");
                    option.value = data[i]['NAME'];
                    option.text = data[i]['NAME'];
                    if (user.dls_queue === data[i]['NAME']) {
                        index = i;
                    }
                    select.add(option);
                }
                select.selectedIndex = index;
            }
            // click by hided link to open place_in_queue block
            document.getElementById('link_deliverylist_settings_id').click();
        } else {
            alert('ERROR (get_all_kaqueues_result): operation result '
                + data[0].success + ', error ' + data[0].error);
        }
    }
}

function dls_save() {
    var archi = document.getElementById('dls_checkbox_id').checked;
    if (archi === true) {
        user.dls_archi = 'yes';
    } else {
        user.dls_archi = 'no';
    }
    user.dls_age = document.getElementById('dls_settings_age').value;
    user.dls_queue = document.getElementById('dls_settings_queue').value;
    localStorage.setItem('user_dls_archi', user.dls_archi);
    localStorage.setItem('user_dls_age', user.dls_age);
    localStorage.setItem('user_dls_queue', user.dls_queue);

    var post_data = {'operation': 'save_user_settings',
                     'user_id': user.id,
                     'archi': user.dls_archi,
                     'age': user.dls_age,
                     'queue': user.dls_queue};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: get_deliverylist_targets_error,
                 success: get_deliverylist_targets_result,
                 timeout: 10000});

    // close delivery list setting screen
    click_close_window();

    // show processing screen for some, while receive data
    document.getElementById('link_processing_id').click();
}

function click_up_down_in_queue(action, delivery_id1, delivery_id2, queue) {
    var post_data = {'operation': 'up_down_in_queue',
                     'action': action,
                     'delivery_id1': delivery_id1,
                     'delivery_id2': delivery_id2,
                     'queue': queue};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: get_merge_queue_data_error,
                 success: get_merge_queue_data_result,
                 timeout: 10000});
}

function click_add_in_queue(id, delivery_id, queue, jira, review, email, description, branch) {
    document.getElementById('place_in_queue_merge_id').value = id;
    document.getElementById('place_in_queue_delivery_id').value = delivery_id;
    document.getElementById('place_in_queue_queue').value = queue;

    // id & target_id zeros (0) means a new entry from KA_trunk queue
    if ((id === 0) && (delivery_id === 0)) {
        document.getElementById('place_in_queue_jira').value = 'KATV-';
        document.getElementById('place_in_queue_review').value = 'https://review.arrisi.com/r/';
        document.getElementById('place_in_queue_email').value = user.email;
        document.getElementById('place_in_queue_description').value = '';
        // set empty branch name
        selectBranchSelector('place_in_queue_branch_selector', '');

    // means edit action with known values
    } else {
        document.getElementById('place_in_queue_jira').value = jira;
        document.getElementById('place_in_queue_review').value = review;
        document.getElementById('place_in_queue_email').value = email;
        document.getElementById('place_in_queue_description').value = decodeURI(description);
        document.getElementById('place_in_queue_branch_selector').value = branch;

        selectBranchSelector('place_in_queue_branch_selector', branch);
    }

    // click by hided link to open place_in_queue block
    document.getElementById('link_place_in_queue_id').click();
}

function delete_from_queue(merge_id) {
    // alert('delete_from_queue ' + merge_id + ' from ' + user.queue);
    if (merge_id > 0) {
        document.getElementById('link_processing_id').click();
        var post_data = {'operation': 'delete_from_queue',
                         'merge_id': merge_id,
                         'queue': user.queue};
        jQuery.ajax({type: "POST",
                     url: JQUERY_URL,
                     dataType: 'json',
                     data: post_data,
                     error: get_merge_queue_data_error,
                     success: get_merge_queue_data_result,
                     timeout: 10000});
    } else {
        alert('Could not remove deliver with unknown ID ' + merge_id);
    }
}

function save_in_queue() {
    // read all hidden value first
    var merge_id = document.getElementById('place_in_queue_merge_id').value;
    var delivery_id = document.getElementById('place_in_queue_delivery_id').value;
    var queue = document.getElementById('place_in_queue_queue').value;

    var jira = document.getElementById('place_in_queue_jira').value;
    jira = jira.replace(/[`~!@#$%^&*()_|+\=?'"<>\n\{\}\[\]\\\/]/gi, '');
    if (jira.length < 1) {
        alert('Please, provide correct JIRA ticket jira.length ' + jira.length + ' "' + jira + '"');
        return;
    }
    var desc = document.getElementById('place_in_queue_description').value;
    desc = desc.replace(/[`~!@#$%^&*()_|+\=?'"<>\n\{\}\[\]\\\/]/gi, '');
    if (desc.length < 1) {
        alert('Please, provide correct description/JIRA title');
        return;
    }
    var review = document.getElementById('place_in_queue_review').value;
    review = review.replace(/[`~!@#$%^&*()_|+\=?'"<>\n]/gi, '');
    if (review.length < 1) {
        alert('Please, provide correct review id');
        return;
    }

    var email = document.getElementById('place_in_queue_email').value;
    email = email.replace(/[`~!#$%^&*()|+\=?;:'"<>\n\{\}\[\]\\\/]/gi, '');
    if (email.length < 1) {
        alert('Please, provide correct user email');
        return;
    }
    var branch = document.getElementById('place_in_queue_branch_selector').value;
    if (branch.length < 1) {
        alert('Please, provide correct branch name');
        return;
    }

    change_user_page('kaqueue');
    // POST data
    var post_data = {'operation': 'add_in_queue',
                     'merge_id': merge_id,
                     'delivery_id': delivery_id,
                     'queue': queue,
                     'jira': jira,
                     'desc': desc,
                     'review': review,
                     'email': email,
                     'branch': branch};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 success: get_merge_queue_data_result});
    click_close_window();
}

function logout() {
    // user = null; // caused login troubles after
    var keys = Object.keys(user);
    for (var i = 0; i < keys.length; i++) {
        user[keys[i]] = '';
        // use HTML5 Local Storage if browser supports it
        if (typeof(Storage) !== "undefined") {
            var storage_key = 'user_' + keys[i];
            localStorage.setItem(storage_key, '');
        } else {
            // TBD: implement cookies version later
        }
    }

    // hide all div element
    document.getElementsByClassName('kaqueue')[0].style.display = 'none';
    document.getElementsByClassName('deliverylist')[0].style.display = 'none';
    document.getElementsByClassName('svncommits')[0].style.display = 'none';
    document.getElementsByClassName('userinfo')[0].style.display = 'none';

    // hide menu content after logout
    document.getElementById('page_selector_user_info_id').innerHTML = '';
    document.getElementById('page_selector_queue_link_id').innerHTML = '';
    document.getElementById('page_selector_list_link_id').innerHTML = '';
    document.getElementById('page_selector_svn_link_id').innerHTML = '';

    document.getElementById('login_forms_arris_id').value = '';
    document.getElementById('login_forms_pswd_id').value = '';

    refresh_data();
}

function selectBranchSelector(selector_id, branch) {
    // selectBranchSelector('place_in_queue_branch_selector', branch);
    $('#' + selector_id).select2('val', branch);
}

// Fetch at most this many items from the server each time.
var dynamicSelectorPageSize = 100;
function activateBranchSelector(selector_id) {
    $('#' + selector_id).select2({
        dropdownAutoWidth: true,
        allowClear: false,
        placeholder: 'Select a branch',
        ajax: {
            url: JQUERY_URL,
            dataType: "json",
            quietMillis: 100,
            data: function (term, page) {
                return {action: 'get_svn_branches',
                        branch_substring: term,
                        limit: dynamicSelectorPageSize,
                        offset: (page - 1) * dynamicSelectorPageSize};
            },
            results: dynamicSelectorTranslateResults(
                function translateResultFunction(item) {
                    return {id: item, text: item};})
        },
        initSelection: dynamicSelectorInitSelection});
}

function dynamicSelectorTranslateResults(translateFunction) {
    return function(serverResults, page) {
        // Translate data format from server to what select2 expects
        var results = [];
        var offset = (page - 1) * dynamicSelectorPageSize;
        for (var i = 0; i < serverResults["result"].length; ++i) {
            results.push(translateFunction(serverResults["result"][i]));
        }
        return {results: results,
                more: serverResults["hasMore"]};
    }
}

function dynamicSelectorInitSelection(element, callback) {
    var value = $(element).val();
    callback({id: value, text: value});
}

function add_new_delivery(delivery_id, target_name, jira, desc, review,
                          jira_priority, customer_priority, regression,
                          email, branch, fa, additional, delivery) {

    document.getElementById('new_delivery_id').value = delivery_id;
    document.getElementById('new_delivery_target_id').value = user.target_id;

    if (delivery_id === 0) {
        document.getElementById('new_delivery_target_name').value = user.target_name;
        document.getElementById('new_delivery_title').innerHTML = user.target_name;

        document.getElementById('new_delivery_jira').value = 'KATV-';
        document.getElementById('new_delivery_review').value = 'https://review.arrisi.com/r/';
        document.getElementById('new_delivery_email').value = user.email;

        document.getElementById('new_delivery_description').value = '';
        document.getElementById('new_delivery_jira_priority').value = '';
        document.getElementById('new_delivery_customer_priority').value = '';
        document.getElementById('new_delivery_regression').value = '';
        document.getElementById('new_delivery_branch_selector').value = '';
        document.getElementById('new_delivery_functional_area').value = '';
        document.getElementById('new_delivery_additional_comments').value = '';
        document.getElementById('new_delivery_delivery_comments').value = '';

        selectBranchSelector('new_delivery_branch_selector', '');

    } else {
        document.getElementById('new_delivery_target_name').value = target_name;
        document.getElementById('new_delivery_title').innerHTML = target_name;

        document.getElementById('new_delivery_jira').value = jira;
        document.getElementById('new_delivery_description').value = decodeURI(desc);
        document.getElementById('new_delivery_review').value = review;
        document.getElementById('new_delivery_jira_priority').value = jira_priority;
        document.getElementById('new_delivery_customer_priority').value = customer_priority;
        document.getElementById('new_delivery_regression').value = regression;
        document.getElementById('new_delivery_email').value = email;
        document.getElementById('new_delivery_branch_selector').value = branch;
        document.getElementById('new_delivery_functional_area').value = fa;
        document.getElementById('new_delivery_additional_comments').value = decodeURI(additional);
        document.getElementById('new_delivery_delivery_comments').value = decodeURI(delivery);

        selectBranchSelector('new_delivery_branch_selector', branch);
    }

    // click by hided link to open place_in_queue block
    document.getElementById('link_add_new_delivery_id').click();
}

function save_in_delivery_list() {
    var delivery_id = document.getElementById('new_delivery_id').value;
    var target_id = document.getElementById('new_delivery_target_id').value;
    var target_name = document.getElementById('new_delivery_target_name').value;

    var jira = document.getElementById('new_delivery_jira').value;
    jira = jira.replace(/[`~!@#$%^&*()_|+\=?'"<>\n\{\}\[\]\\\/]/gi, '');
    if (jira.length < 1) {
        alert('Please, provide correct JIRA ticket jira.length ' + jira.length + ' "' + jira + '"');
        return;
    }
    var desc = document.getElementById('new_delivery_description').value;
    desc = desc.replace(/[`~!@#$%^&*()_|+\=?'"<>\n\{\}\[\]\\\/]/gi, '');
    if (desc.length < 1) {
        alert('Please, provide correct description/JIRA title');
        return;
    }
    var review = document.getElementById('new_delivery_review').value;
    review = review.replace(/[`~!@#$%^&*()_|+\=?'"<>\n]/gi, '');
    if (review.length < 1) {
        alert('Please, provide correct review id');
        return;
    }

    var jirap = document.getElementById('new_delivery_jira_priority').value;
    if (jirap.length < 1) {
        alert('Please, provide correct JIRA Priority');
        return;
    }

    var customerp = document.getElementById('new_delivery_customer_priority').value;
    var regression = document.getElementById('new_delivery_regression').value;
    if (regression.length < 1) {
        alert('Please, provide correct Regression value');
        return;
    }

    var email = document.getElementById('new_delivery_email').value;
    email = email.replace(/[`~!#$%^&*()|+\=?;:'"<>\n\{\}\[\]\\\/]/gi, '');
    if (email.length < 1) {
        alert('Please, provide correct user email');
        return;
    }
    var branch = document.getElementById('new_delivery_branch_selector').value;
    if (branch.length < 1) {
        alert('Please, provide correct branch name');
        return;
    }

    var fa = document.getElementById('new_delivery_functional_area').value;
    if (fa.length < 1) {
        alert('Please, provide Functional Area');
        return;
    }

    var additional = document.getElementById('new_delivery_additional_comments').value;
    additional = additional.replace(/[`~!@#$%^&*()_|+\=?'"<>\n\{\}\[\]\\\/]/gi, '');

    var delivery = document.getElementById('new_delivery_delivery_comments').value;
    delivery = delivery.replace(/[`~!@#$%^&*()_|+\=?'"<>\n\{\}\[\]\\\/]/gi, '');
    if (delivery.length < 1) {
        alert('Please, add delivery comments');
        return;
    }

    // POST data
    var post_data = {'operation': 'add_in_deliverylist',
                     'delivery_id': delivery_id,
                     'target_id': target_id,
                     'target_name': target_name,
                     'jira': jira,
                     'desc': desc,
                     'review': review,
                     'jirap': jirap,
                     'customerp': customerp,
                     'regression': regression,
                     'email': email,
                     'branch': branch,
                     'fa': fa,
                     'additional': additional,
                     'delivery': delivery};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: get_target_content_error,
                 success: get_target_content_result,
                 timeout: 10000});

    // close current '#new_delivery' window and open processing
    click_close_window();
    document.getElementById('link_processing_id').click();
}

function edit_delivery(delivery_id) {
    document.getElementById('link_processing_id').click();
    var post_data = {'operation': 'get_delivery_data',
                     'delivery_id': delivery_id};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: get_delivery_data_error,
                 success: get_delivery_data_result,
                 timeout: 10000});
}

function get_delivery_data_error(xhr, textStatus, errorThrown) {
    alert('get_delivery_data_error, xhr.status ' + xhr.status + ', textStatus '
          + textStatus + ', errorThrown ' + errorThrown);
    click_close_window();
}

function get_delivery_data_result(data) {
    // alert('get_delivery_data_result ' + JSON.stringify(data));
    click_close_window();
    if ((data !== null) && (data !== undefined)) {
        if (data[0].success === true) {
            add_new_delivery(data[1].id, data[1].target, data[1].jiraid,
                             encodeURI(data[1].jira_summary), data[1].review,
                             data[1].jira_priority, data[1].customer_priority,
                             data[1].regression, data[1].assignee, data[1].project,
                             data[1].functional_area, encodeURI(data[1].additional_comments),
                             encodeURI(data[1].delivery_comments));
        } else {
            alert('ERROR (get_delivery_data_result): operation result '
                + data[0].success + ', error ' + data[0].error);
        }
    } else {
        alert('ERROR (get_delivery_data_result): Did not receive delivery data from server');
    }
}

function approve_delivery(delivery_id) {
    if (delivery_id > 0) {
        document.getElementById('link_processing_id').click();
        var post_data = {'operation': 'approve_delivery',
                         'delivery_id': delivery_id,
                         'target_id': user.target_id,
                         'target_name': user.target_name};
        jQuery.ajax({type: "POST",
                     url: JQUERY_URL,
                     dataType: 'json',
                     data: post_data,
                     error: get_target_content_error,
                     success: get_target_content_result,
                     timeout: 10000});
    } else {
        alert('Sorry, you are trying to remove delivery with unknown delivery_id value ' + delivery_id);
    }
}

function edit_approval_status(delivery_id) {
    if (delivery_id > 0) {
        document.getElementById('edit_approval_delivery_id').value = delivery_id;

        document.getElementById('link_edit_approval_status_id').click();

    } else {
        alert('Sorry, you are trying to change approval status with unknown delivery_id value ' + delivery_id);
    }
}

function change_delivery_approval_status() {
    var delivery_id = document.getElementById('edit_approval_delivery_id').value;
    if (delivery_id > 0) {
        var approval_status = document.getElementById('edit_approval_status_value_id').value;
        if (approval_status === 'Delivered') {
            var revision = document.getElementById('edit_approval_status_revision_id').value;
            if (revision.length !== 6) {
                alert('Revision length is less than 6 ' + revision);
                return;
            } else {
                approval_status += ',' + revision;
            }
        }

        document.getElementById('link_processing_id').click();
        var post_data = {'operation': 'change_delivery_approval_status',
                         'delivery_id': delivery_id,
                         'approval_status': approval_status,
                         'target_id': user.target_id,
                         'target_name': user.target_name};
        jQuery.ajax({type: "POST",
                     url: JQUERY_URL,
                     dataType: 'json',
                     data: post_data,
                     error: get_target_content_error,
                     success: get_target_content_result,
                     timeout: 10000});
    } else {
        alert('Sorry, you are trying to remove delivery with unknown delivery_id value ' + delivery_id);
    }
}

function approval_status_select_event() {
    var approval_status = document.getElementById('edit_approval_status_value_id');
    var revision = document.getElementById('edit_approval_status_revision_id');
    if (approval_status.value === 'Delivered') {
        revision.style.visibility = 'visible';
    } else {
        revision.style.visibility = 'hidden';
    }
}

function copy_move_delivery(delivery_id, index, action) {
    var table = document.getElementById('deliverylist_table_id');
    if (index < table.rows.length) {
        var jira = table.rows[index].cells.item(1).innerHTML;
        var summary = table.rows[index].cells.item(3).innerHTML;
        var email = table.rows[index].cells.item(5).innerHTML;

        var title = document.getElementById('copy_move_delivery_title');
        var btn = document.getElementById('copy_move_delivery_btn');
        if (action === 'copy') {
            title.innerHTML = 'COPY DELIVERY';
            btn.innerHTML = 'COPY';
        } else {
            title.innerHTML = 'MOVE DELIVERY';
            btn.innerHTML = 'MOVE';
        }

        document.getElementById('copy_move_delivery_id').value = delivery_id;
        document.getElementById('copy_move_delivery_action').value = action;

        document.getElementById('copy_move_delivery_jira').innerHTML = jira.replace(/<br>/g, ", ");
        document.getElementById('copy_move_delivery_description').value = summary;
        document.getElementById('copy_move_delivery_creator').innerHTML = 'Created by&nbsp;' + email;

        // request delivery list data from server
        var post_data = {'operation': 'get_deliverylist_targets',
                         'archived': user.dls_archi,
                         'age': user.dls_age,
                         'queue': user.dls_queue};
        jQuery.ajax({type: "POST",
                     url: JQUERY_URL,
                     dataType: 'json',
                     data: post_data,
                     error: copy_move_delivery_error,
                     success: copy_move_delivery_result,
                     timeout: 10000});

        document.getElementById('link_processing_id').click();

    } else {
        alert('Sorry, you are trying to copy item ' + index + ', which is absent in table');
    }
}

function copy_move_delivery_error(xhr, textStatus, errorThrown) {
    click_close_window();
    //alert('get_deliverylist_targets_error, xhr.status ' + xhr.status + ', textStatus '
    //    + textStatus + ', errorThrown ' + errorThrown);
}

function copy_move_delivery_result(data) {
    click_close_window();
    if ((data !== null) && (data !== undefined)) {
        if (data[0].success === true) {
            var select = document.getElementById('copy_move_delivery_target_selector');
            // remove all previous options from select
            if (select.length > 1) {
                for (var i = select.length; i > 0; i--) {
                    select.remove(i-1);
                }
            }

            if (data.length > 1) {
                for (var i = 1; i < data.length; i++) {
                    if (user.target_name !== data[i]['NAME']) {
                        var option = document.createElement("option");
                        //option.value = data[i]['ID'];
                        option.value = data[i]['NAME'];
                        option.text = data[i]['NAME'];
                        select.add(option);
                    }
                }
            } else {
                // TBD...
            }

            document.getElementById('link_copy_move_delivery_id').click();
        }
    }
}

function copy_move_delivery_from_target() {
    var delivery_id = document.getElementById('copy_move_delivery_id').value;
    var action = document.getElementById('copy_move_delivery_action').value;
    var destination = document.getElementById('copy_move_delivery_target_selector').value;

    if (delivery_id !== 0) {
        var post_data = {'operation': 'copy_move_delivery_from_target',
                         'delivery_id': delivery_id,
                         'action': action,
                         'destination': destination,
                         'target_id': user.target_id,
                         'target_name': user.target_name};
        // alert('YURA ' + JSON.stringify(post_data));
        jQuery.ajax({type: "POST",
                     url: JQUERY_URL,
                     dataType: 'json',
                     data: post_data,
                     error: get_target_content_error,
                     success: get_target_content_result,
                     timeout: 10000});
    }
}

function remove_delivery(delivery_id, index) {
    var table = document.getElementById('deliverylist_table_id');
    if (index < table.rows.length) {
        var jira = table.rows[index].cells.item(1).innerHTML;
        var summary = table.rows[index].cells.item(3).innerHTML;
        var email = table.rows[index].cells.item(5).innerHTML;

        document.getElementById('removal_delivery_id').value = delivery_id;

        document.getElementById('removal_delivery_jira').innerHTML = jira;
        document.getElementById('removal_delivery_description').innerHTML = summary;
        document.getElementById('removal_delivery_creator').innerHTML = 'Created by ' + email;

        document.getElementById('link_remove_delivery_id').click();

    } else {
        alert('Sorry, you are trying to remove item ' + index + ', which is absent in table');
    }
}

function remove_delivery_from_target() {
    var delivery_id = document.getElementById('removal_delivery_id').value;
    if (delivery_id > 0) {
        document.getElementById('link_processing_id').click();
        var post_data = {'operation': 'remove_delivery_from_target',
                         'delivery_id': delivery_id,
                         'target_id': user.target_id,
                         'target_name': user.target_name};
        jQuery.ajax({type: "POST",
                     url: JQUERY_URL,
                     dataType: 'json',
                     data: post_data,
                     error: get_target_content_error,
                     success: get_target_content_result,
                     timeout: 10000});
    } else {
        alert('Sorry, you are trying to remove delivery with unknown delivery_id value ' + delivery_id);
    }
}

function add_new_queue(queue_id, name, desc, type, subsc, approvals) {
    if (queue_id !== 0) {
        document.getElementById('add_queue_id').value = queue_id;
        document.getElementById('add_queue_name_id').value = name;
        document.getElementById('add_queue_description_id').value = desc;
        document.getElementById('add_queue_type_id').value = type;
        // document.getElementById('add_queue_subscribers_id').value = subsc;
        document.getElementById('add_queue_approvals_id').value = approvals;
    } else {
        document.getElementById('add_queue_id').value = 0;
        document.getElementById('add_queue_name_id').value = '';
        document.getElementById('add_queue_description_id').value = '';
        document.getElementById('add_queue_type_id').value = '';
        // document.getElementById('add_queue_subscribers_id').value = '';
        document.getElementById('add_queue_approvals_id').value = '';
    }

    document.getElementById('link_add_queue_id').click();
}

function save_new_queue() {
    queue_id = document.getElementById('add_queue_id').value;

    var name = document.getElementById('add_queue_name_id').value;
    if (name.length < 2) {
        alert('Sorry, you have to provide valid Merge Queue name');
        return;
    }

    var type = document.getElementById('add_queue_type_id').value;
    var desc = document.getElementById('add_queue_description_id').value;
    var aprv = document.getElementById('add_queue_approvals_id').value;

    var post_data = {'operation': 'add_new_queue',
                     'queue_id': queue_id,
                     'name': name,
                     'owner': user.email,
                     'type': type,
                     'description': desc,
                     'approvals': aprv,
                     'queue_status': user.queue_status};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: save_new_queue_error,
                 success: save_new_queue_result,
                 timeout: 10000});
    document.getElementById('link_processing_id').click();
}

function save_new_queue_error(xhr, textStatus, errorThrown) {
    // close procesing/in progress window
    alert('UPPSss ' + textStatus);
    click_close_window();
}

function save_new_queue_result(data) {
    click_close_window();
    if (data.success === "true") {
        get_admin_merge_queues_data();
    } else {
        var text = document.getElementById('warning_text_id');
        text.innerHTML = "Could not ADD/UPDATE queue, server returned '" + data.error + "'";
        document.getElementById('link_warning_id').click();
    }
}

function remove_merge_queue(queue_id) {
    // alert('remove_merge_queue:: ' + queue_id);
    var post_data = {'operation': 'remove_merge_queue',
                     'queue_id': queue_id};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: get_admin_merge_queues_data_error,
                 success: get_admin_merge_queues_data_result,
                 timeout: 10000});
    document.getElementById('link_processing_id').click();
}

function deactivate_merge_queue(queue_id) {
    var post_data = {'operation': 'deactivate_merge_queue',
                     'queue_id': queue_id};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: get_admin_merge_queues_data_error,
                 success: get_admin_merge_queues_data_result,
                 timeout: 10000});
    document.getElementById('link_processing_id').click();
}

function edit_merge_queue(queue_id) {
    var post_data = {'operation': 'edit_merge_queue',
                     'queue_id': queue_id};
    jQuery.ajax({type: "POST",
                 url: JQUERY_URL,
                 dataType: 'json',
                 data: post_data,
                 error: edit_merge_queue_error,
                 success: edit_merge_queue_result,
                 timeout: 10000});
    document.getElementById('link_processing_id').click();
}

function edit_merge_queue_result(data) {
    // alert('edit_merge_queue_result ' + JSON.stringify(data));
    click_close_window();
    if ((data !== null) && (data !== undefined)) {
        if (data[0].success === true) {
            add_new_queue(data[1]['ID'], data[1]['NAME'], data[1]['DESCRIPTION'], data[1]['TYPE'], data[1]['SUBSCRIBERS'], data[1]['APPROVALS']);
        }
    }
}

function edit_merge_queue_error(xhr, textStatus, errorThrown) {
    // close procesing/in progress window
    click_close_window();
}

// Number.isNumber is part of ES6 so not supported by IE11
Number.isInteger = Number.isInteger || function(value) {
    return typeof value === "number" && 
           isFinite(value) && 
           Math.floor(value) === value;
};
