<?php
    // php -f port_data.php

    define("DB_HOST", "localhost");
    define("DB_USER", "build_system");
    define("DB_PSWD", "build_system");
    define("DB_DB", "test");

    if ($db_link = mysqli_connect(DB_HOST, DB_USER, DB_PSWD, DB_DB)) {
        $select = "SELECT * FROM target_list";
        if ($result = mysqli_query($db_link, $select)) {
            $row_cnt = mysqli_num_rows($result);
            error_log('target_list row COUNTS: ' . $row_cnt);
            while($row = $result->fetch_array(MYSQLI_ASSOC)) {
                $row_id = $row['id']; $row_name = $row['target'];
                $row_subscribers = $row['subscribers']; $row_queue = $row['queue'];
                if ($row['archived'] === 'yes') {
                    $row_archi = TRUE;
                } else {
                    $row_archi = FALSE;
                }

                $insert = "INSERT INTO targets (`ID`, `NAME`, `CREATOR`, `ARCHIVED`, `QUEUE`, `SUBSCRIBERS`, `DATE`) "
                         ."VALUES ('$row_id', '$row_name', 'Art.Jost@arris.com', '$row_archi', '$row_queue', '$row_subscribers', NOW())";

                if (mysqli_query($db_link, $insert)) {
                    // error_log("Inserted " . $row_name);
                } else {
                    error_log("ERROR in INSERT " . $row_name ." error " . mysqli_error($db_link));
                }
            }
            mysqli_free_result($result);
        } else {
            error_log("Could not SELECT from target_list");
        }

        $select = "SELECT * FROM delivery_list";
        if ($result = mysqli_query($db_link, $select)) {
            $row_cnt = mysqli_num_rows($result);
            error_log('delivery_list row COUNTS: ' . $row_cnt);
            while($row = $result->fetch_array(MYSQLI_ASSOC)) {
                $name = $row['target']; $jira = $row['jiraid']; $desc = $row['jira_summary'];
                $review = $row['review']; $jirap = $row['jira_priority'];
                $cp = $row['customer_priority']; $fa = $row['functional_area']; $ad = $row['additional_comments'];
                $regr = $row['regression'];

                $insert = "INSERT INTO deliveries (`TARGET_ID`, `TARGET_NAME`, `APPROVED_BY`, `JIRA`, `DESCRIPTION`, `REVIEW`, `JIRAP`, "
                         ."`CUSTOMERP`, `REGRESSION`, `EMAIL`, `BRANCH`, `FA`, `ADDITIONAL`, `COMMENTS`, `DATE`) VALUES ("
                         ."1, '$name', 'Art.Jost@arris.com', '$jira', '$desc', '$review', '$jirap', '$cp', '$regr', '$fa', '$ad', NOW())";

                if (mysqli_query($db_link, $insert)) {
                    // error_log("Inserted " . $row_name);
                } else {
                    error_log("ERROR in INSERT " . $row_name ." error " . mysqli_error($db_link));
                }
            }
            mysqli_free_result($result);
        } else {
            error_log("Could not SELECT from target_list");
        }

        mysqli_close($db_link);
    } else {
        error_log("Could not connect to local DB");
    }
?>
