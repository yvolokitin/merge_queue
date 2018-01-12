<?php
    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache');

    define("DB_HOST", "localhost");
    define("DB_USER", "build_system");
    define("DB_PSWD", "build_system");
    define("DB_DB", "test");

    while (1) {
        $data = json_encode(get_merge_queue_data());
        echo "data: {$data}\n\n";
        ob_end_flush();
        flush();
        sleep(13);
    }

    function get_merge_queue_data() {
        $errors = "";
        if ($db_link = mysqli_connect(DB_HOST, DB_USER, DB_PSWD, DB_DB)) {
                $select = "SELECT * FROM merge_queue";
                if ($result = mysqli_query($db_link, $select)) {
                    $row_cnt = mysqli_num_rows($result);
                    $data[] = array('success' => TRUE, 'current_date' => date('Y-m-d H:i:s'));
                    if ($row_cnt > 0) {
                        while($row = $result->fetch_array(MYSQLI_ASSOC)) {
                            $data[] = $row;
                        }
                    }
                    mysqli_free_result($result);
                } else {
                    $errors = "Could not perform SELECT query";
                }
                mysqli_close($db_link);
            } else {
                $errors = "Could not connect to local DB";
        }

        if (strlen($errors) > 0) {
            error_log("ERROR: (get_merge_queue_data) " . $errors);
            $error_response = array('success' => FALSE,
                                    'error' => $errors);
            return $error_response;
        } else {
            return $data;
        }
    }
?>
