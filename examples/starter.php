<?php
declare(strict_types=1);
session_start();
if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
function e(string $value): string { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function posted(string $key): string { return isset($_POST[$key]) && is_string($_POST[$key]) ? trim($_POST[$key]) : ''; }
$errors = []; $name = ''; $email = ''; $plan = 'free'; $notifications = false; $success = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = posted('name'); $email = posted('email'); $plan = posted('plan');
    $notifications = posted('notifications') === '1';
    if (!hash_equals($_SESSION['csrf'], posted('csrf'))) {
        $errors['form'] = 'Your session expired. Reload the page and try again.';
        http_response_code(403);
    }
    if ($name === '' || strlen($name) > 120) $errors['name'] = 'Enter a name of 1–120 bytes.';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) $errors['email'] = 'Enter a valid email address.';
    if (!in_array($plan, ['free', 'pro'], true)) $errors['plan'] = 'Choose a valid plan.';
    $success = count($errors) === 0;
    // Save to your database here using a prepared statement.
    // This starter only validates and echoes submitted values; it does not persist them.
}
?>
<!doctype html>
<html lang="en" data-bs-theme="light">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Account settings — PHP starter</title>
  <link rel="stylesheet" href="../dist/bootstrapcn.css">
  <script type="module" src="../dist/bootstrapcn.js"></script>
  <style>
    main { max-width: 560px; margin: 4rem auto; padding: 0 1rem; }
    .starter-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .fields { display: grid; gap: 1.25rem; }.notice { margin-bottom: 1rem; }
    .check-label { display: flex; gap: .75rem; align-items: center; }
  </style>
</head>
<body><main>
  <div class="starter-top"><a href="../index.html">← Component library</a><button type="button" class="sc-button sc-button-outline" data-sc-theme-toggle>Toggle theme</button></div>
  <?php if ($success): ?>
    <div class="sc-alert notice" role="status"><strong>Validation passed, <?= e($name) ?>.</strong><p>This demo has not saved anything. Connect your database in the PHP handler.</p></div>
  <?php elseif ($errors): ?>
    <div class="sc-alert sc-alert-destructive notice" role="alert"><strong>Please review your submission.</strong><p><?= e($errors['form'] ?? 'Correct the fields below and submit again.') ?></p></div>
  <?php endif; ?>
  <article class="card">
    <div class="card-header"><h1 class="card-title">Account settings</h1><p class="card-description">A working server-rendered form. No frontend build tools.</p></div>
    <form method="post"><input type="hidden" name="csrf" value="<?= e($_SESSION['csrf']) ?>">
      <div class="card-body fields">
        <div class="sc-field"><label for="name">Display name</label>
          <input class="form-control" id="name" name="name" value="<?= e($name) ?>" autocomplete="name" required maxlength="120"<?= isset($errors['name']) ? ' aria-invalid="true" aria-describedby="name-error"' : '' ?>>
          <?php if (isset($errors['name'])): ?><span class="sc-field-error" id="name-error"><?= e($errors['name']) ?></span><?php endif; ?>
        </div>
        <div class="sc-field"><label for="email">Email</label>
          <input class="form-control" type="email" id="email" name="email" value="<?= e($email) ?>" autocomplete="email" required maxlength="254"<?= isset($errors['email']) ? ' aria-invalid="true" aria-describedby="email-error"' : '' ?>>
          <?php if (isset($errors['email'])): ?><span class="sc-field-error" id="email-error"><?= e($errors['email']) ?></span><?php endif; ?>
        </div>
        <div class="sc-field"><label for="plan">Plan</label>
          <select class="sc-select" id="plan" name="plan"<?= isset($errors['plan']) ? ' aria-invalid="true" aria-describedby="plan-error"' : '' ?>>
            <?php foreach (['free' => 'Free', 'pro' => 'Pro'] as $value => $label): ?><option value="<?= e($value) ?>"<?= $plan === $value ? ' selected' : '' ?>><?= e($label) ?></option><?php endforeach; ?>
          </select>
          <?php if (isset($errors['plan'])): ?><span class="sc-field-error" id="plan-error"><?= e($errors['plan']) ?></span><?php endif; ?>
        </div>
        <label class="check-label"><input class="sc-switch" type="checkbox" role="switch" name="notifications" value="1"<?= $notifications ? ' checked' : '' ?>> Email notifications</label>
      </div>
      <div class="card-footer"><button class="sc-button" type="submit">Validate settings</button></div>
    </form>
  </article>
</main></body></html>
