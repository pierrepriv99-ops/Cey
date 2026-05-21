package com.cryos.launcher;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.view.Gravity;
import android.widget.*;
import java.util.*;

/**
 * CryOS Launcher - Main Activity
 * 
 * Custom Android home screen with Frost UI design.
 */
public class MainActivity extends Activity {
    
    private GridLayout homeGrid;
    private List<AppInfo> installedApps;
    private LinearLayout dockContainer;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        initializeViews();
        loadInstalledApps();
    }
    
    private void initializeViews() {
        homeGrid = findViewById(R.id.home_grid);
        dockContainer = findViewById(R.id.dock_container);
        
        TextView dateTime = findViewById(R.id.date_time);
        updateDateTime(dateTime);
    }
    
    private void loadInstalledApps() {
        new Thread(() -> {
            Intent intent = new Intent(Intent.ACTION_MAIN, null);
            intent.addCategory(Intent.CATEGORY_LAUNCHER);
            
            PackageManager pm = getPackageManager();
            List<ResolveInfo> apps = pm.queryIntentActivities(intent, 0);
            
            List<AppInfo> appList = new ArrayList<>();
            for (ResolveInfo info : apps) {
                if (info.activityInfo.packageName.equals(getPackageName())) continue;
                AppInfo app = new AppInfo();
                app.name = info.loadLabel(pm).toString();
                app.packageName = info.activityInfo.packageName;
                app.icon = info.loadIcon(pm);
                appList.add(app);
            }
            
            Collections.sort(appList, (a, b) -> a.name.compareToIgnoreCase(b.name));
            
            runOnUiThread(() -> {
                installedApps = appList;
                populateHomeScreen(appList);
                populateDock(appList);
            });
        }).start();
    }
    
    private void populateHomeScreen(List<AppInfo> apps) {
        int columns = 4;
        homeGrid.setColumnCount(columns);
        
        for (int i = 0; i < Math.min(16, apps.size()); i++) {
            AppInfo app = apps.get(i);
            View iconView = createAppIcon(app);
            
            GridLayout.LayoutParams params = new GridLayout.LayoutParams();
            params.width = 0;
            params.height = GridLayout.LayoutParams.MATCH_PARENT;
            params.rowSpec = GridLayout.spec(i / columns, 1f);
            params.columnSpec = GridLayout.spec(i % columns, 1f);
            params.setGravity(Gravity.FILL);
            
            homeGrid.addView(iconView, params);
        }
    }
    
    private void populateDock(List<AppInfo> apps) {
        String[] favorites = {"com.android.phone", "com.android.contacts", 
            "com.androidMessaging", "com.android.browser"};
        
        for (String pkg : favorites) {
            for (AppInfo app : apps) {
                if (app.packageName.equals(pkg)) {
                    addToDock(app);
                    break;
                }
            }
        }
    }
    
    private View createAppIcon(AppInfo app) {
        LinearLayout container = new LinearLayout(this);
        container.setOrientation(LinearLayout.VERTICAL);
        container.setGravity(Gravity.CENTER);
        
        ImageView icon = new ImageView(this);
        icon.setImageDrawable(app.icon);
        
        TextView label = new TextView(this);
        label.setText(app.name);
        label.setTextSize(10);
        label.setTextColor(0xFFE8F4FC);
        label.setGravity(Gravity.CENTER);
        label.setMaxLines(1);
        
        container.addView(icon);
        container.addView(label);
        
        container.setOnClickListener(v -> launchApp(app));
        
        return container;
    }
    
    private void addToDock(AppInfo app) {
        View iconView = createAppIcon(app);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            0, LinearLayout.LayoutParams.MATCH_PARENT, 1f);
        dockContainer.addView(iconView, params);
    }
    
    private void launchApp(AppInfo app) {
        Intent intent = getPackageManager().getLaunchIntentForPackage(app.packageName);
        if (intent != null) startActivity(intent);
    }
    
    private void updateDateTime(TextView view) {
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat(
            "EEE, MMM d\nh:mm a", java.util.Locale.getDefault());
        view.setText(sdf.format(new java.util.Date()));
    }
    
    static class AppInfo {
        String name;
        String packageName;
        Drawable icon;
    }
}